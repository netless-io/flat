import type AgoraSdk from "agora-electron-sdk";
import type { AgoraNetworkQuality, RtcStats } from "agora-electron-sdk/types/Api/native_type";
import {
    FlatRTC,
    FlatRTCAvatar,
    FlatRTCDevice,
    FlatRTCEventData,
    FlatRTCEventNames,
    FlatRTCJoinRoomConfigBase,
    FlatRTCMode,
    FlatRTCNetworkQualityType,
    FlatRTCRole,
} from "@netless/flat-rtc";
import { SideEffectManager } from "side-effect-manager";
import Emittery from "emittery";
import { RTCRemoteAvatar } from "./rtc-remote-avatar";
import { RTCLocalAvatar } from "./rtc-local-avatar";

export type FlatRTCAgoraElectronUIDType = number;

export type FlatRTCAgoraElectronJoinRoomConfig =
    FlatRTCJoinRoomConfigBase<FlatRTCAgoraElectronUIDType>;

export interface FlatRTCAgoraElectronDevice {
    devicename: string;
    deviceid: string;
}

export type IFlatRTCAgoraElectron = FlatRTC<
    FlatRTCAgoraElectronUIDType,
    FlatRTCAgoraElectronJoinRoomConfig
>;

export class FlatRTCAgoraElectron implements IFlatRTCAgoraElectron {
    private static LOW_VOLUME_LEVEL_THRESHOLD = 0.00001;

    private static rtcEngine: AgoraSdk;

    private static _instance?: FlatRTCAgoraElectron;

    public static getInstance(): FlatRTCAgoraElectron {
        return (FlatRTCAgoraElectron._instance ??= new FlatRTCAgoraElectron());
    }

    public static setRtcEngine(rtcEngine: AgoraSdk): void {
        FlatRTCAgoraElectron.rtcEngine = rtcEngine;
        if (this._instance) {
            this._instance._init();
        }
    }

    public get rtcEngine(): AgoraSdk {
        return FlatRTCAgoraElectron.rtcEngine;
    }

    private readonly _sideEffect = new SideEffectManager();
    private readonly _roomSideEffect = new SideEffectManager();

    private _cameraID?: string;
    private _micID?: string;
    private _speakerID?: string;

    private uid?: FlatRTCAgoraElectronUIDType;
    private roomUUID?: string;

    private _volumeLevels = new Map<FlatRTCAgoraElectronUIDType, number>();

    private _remoteAvatars = new Map<FlatRTCAgoraElectronUIDType, RTCRemoteAvatar>();

    public get remoteAvatars(): FlatRTCAvatar[] {
        return [...this._remoteAvatars.values()];
    }

    private _localAvatar?: RTCLocalAvatar;
    public get localAvatar(): FlatRTCAvatar {
        return (this._localAvatar ??= new RTCLocalAvatar({ rtc: this }));
    }

    public readonly events = new Emittery<FlatRTCEventData, FlatRTCEventData>();

    private constructor() {
        if (FlatRTCAgoraElectron.rtcEngine) {
            this._init();
        }
    }

    private _init(): void {
        this._sideEffect.add(() => {
            const rtcEngine = this.rtcEngine; // keep this in closure
            const getSpeakerID = (): string | undefined => {
                try {
                    return (rtcEngine.getCurrentAudioPlaybackDevice() as FlatRTCAgoraElectronDevice)
                        ?.deviceid;
                } catch (e) {
                    console.error(e);
                    return;
                }
            };

            const getMicID = (): string | undefined => {
                try {
                    return (
                        rtcEngine.getCurrentAudioRecordingDevice() as FlatRTCAgoraElectronDevice
                    )?.deviceid;
                } catch (e) {
                    console.error(e);
                    return;
                }
            };

            const getCameraID = (): string | undefined => {
                try {
                    return (rtcEngine.getCurrentVideoDevice() as FlatRTCAgoraElectronDevice)
                        ?.deviceid;
                } catch (e) {
                    console.error(e);
                    return;
                }
            };

            this._cameraID = getCameraID();
            this._micID = getMicID();
            this._speakerID = getSpeakerID();

            const onAudioDeviceStateChanged = (): void => {
                const micID = getMicID();
                const speakerID = getSpeakerID();
                if (micID) {
                    this.setMicID(micID);
                }
                if (speakerID) {
                    this.setSpeakerID(speakerID);
                }
            };

            const onVideoDeviceStateChanged = (): void => {
                const cameraID = getCameraID();
                if (cameraID) {
                    this.setCameraID(cameraID);
                }
            };

            rtcEngine.on("audioDeviceStateChanged", onAudioDeviceStateChanged);
            rtcEngine.on("videoDeviceStateChanged", onVideoDeviceStateChanged);

            return () => {
                rtcEngine.off("audioDeviceStateChanged", onAudioDeviceStateChanged);
                rtcEngine.off("videoDeviceStateChanged", onVideoDeviceStateChanged);
            };
        }, "init");

        if (process.env.NODE_ENV === "development") {
            this._sideEffect.add(() => {
                const rtcEngine = this.rtcEngine;

                const onJoinedChannel = (channel: string, uid: number): void => {
                    console.log(`[RTC] ${uid} join channel ${channel}`);
                };

                const onUserJoined = (uid: string): void => {
                    console.log("[RTC] userJoined", uid);
                };

                const onLeavechannel = (): void => {
                    console.log("[RTC] onleaveChannel");
                };

                const onError = (err: number, msg: string): void => {
                    console.error("[RTC] onerror----", err, msg);
                };

                rtcEngine.on("joinedChannel", onJoinedChannel);
                rtcEngine.on("userJoined", onUserJoined);
                rtcEngine.on("leavechannel", onLeavechannel);
                rtcEngine.on("error", onError);

                return () => {
                    rtcEngine.off("joinedChannel", onJoinedChannel);
                    rtcEngine.off("userJoined", onUserJoined);
                    rtcEngine.off("leavechannel", onLeavechannel);
                    rtcEngine.off("error", onError);
                };
            }, "dev-log");
        }
    }

    public async destroy(): Promise<void> {
        this._sideEffect.flushAll();

        await this.leaveRoom();
    }

    public async joinRoom(config: FlatRTCAgoraElectronJoinRoomConfig): Promise<void> {
        if (!FlatRTCAgoraElectron.rtcEngine) {
            throw new Error("AgoraRTC is not provided");
        }

        if (this.roomUUID) {
            if (this.roomUUID === config.roomUUID) {
                return;
            }
            this.leaveRoom();
        }
        return this._join(config);
    }

    public async leaveRoom(): Promise<void> {
        if (this.roomUUID) {
            this.rtcEngine.leaveChannel();
            this.rtcEngine.videoSourceLeave();
        }

        this.uid = undefined;
        this.roomUUID = undefined;
    }

    public getAvatar(uid?: FlatRTCAgoraElectronUIDType): FlatRTCAvatar {
        if (!uid || this.uid === uid) {
            return this.localAvatar;
        }
        let remoteAvatar = this._remoteAvatars.get(uid);
        if (!remoteAvatar) {
            remoteAvatar = new RTCRemoteAvatar({ rtc: this, uid });
            this._remoteAvatars.set(uid, remoteAvatar);
        }
        return remoteAvatar;
    }

    public getVolumeLevel(uid?: FlatRTCAgoraElectronUIDType): number {
        return this._volumeLevels.get(uid || 0) || 0;
    }

    public setRole(role: FlatRTCRole): void {
        if (this.rtcEngine) {
            this.rtcEngine.setClientRole(role === FlatRTCRole.Host ? 1 : 2);
        }
    }

    public getCameraID(): string | undefined {
        return this._cameraID;
    }

    public async setCameraID(deviceId: string): Promise<void> {
        if (this._cameraID !== deviceId) {
            this.rtcEngine.setVideoDevice(deviceId);
            this._cameraID = deviceId;
            this.events.emit("camera-changed", deviceId);
        }
    }

    public async getCameraDevices(): Promise<FlatRTCDevice[]> {
        return (this.rtcEngine.getVideoDevices() as FlatRTCAgoraElectronDevice[]).map(device => ({
            deviceId: device.deviceid,
            label: device.devicename,
        }));
    }

    public getMicID(): string | undefined {
        return this._micID;
    }

    public async setMicID(deviceId: string): Promise<void> {
        if (this._micID !== deviceId) {
            this.rtcEngine.setAudioRecordingDevice(deviceId);
            this._micID = deviceId;
            this.events.emit("mic-changed", deviceId);
        }
    }

    public async getMicDevices(): Promise<FlatRTCDevice[]> {
        return (this.rtcEngine.getAudioRecordingDevices() as FlatRTCAgoraElectronDevice[]).map(
            device => ({
                deviceId: device.deviceid,
                label: device.devicename,
            }),
        );
    }

    /** Does not support  */
    public getSpeakerID(): string | undefined {
        return this._speakerID;
    }

    public async setSpeakerID(deviceId: string): Promise<void> {
        if (this._speakerID !== deviceId) {
            this._speakerID = deviceId;
            this.rtcEngine.setAudioPlaybackDevice(deviceId);
            this.events.emit("speaker-changed", deviceId);
        }
    }

    public async getSpeakerDevices(): Promise<FlatRTCDevice[]> {
        return (this.rtcEngine.getAudioPlaybackDevices() as FlatRTCAgoraElectronDevice[]).map(
            device => ({
                deviceId: device.deviceid,
                label: device.devicename,
            }),
        );
    }

    private async _join({
        uid,
        token,
        mode,
        isLocalUID,
        refreshToken,
        role,
        roomUUID,
    }: FlatRTCAgoraElectronJoinRoomConfig): Promise<void> {
        const channelProfile = mode === FlatRTCMode.Broadcast ? 1 : 0;
        this.rtcEngine.setChannelProfile(channelProfile);
        this.rtcEngine.videoSourceSetChannelProfile(channelProfile);
        this.rtcEngine.setVideoEncoderConfiguration({
            bitrate: 0,
            degradationPreference: 1,
            frameRate: 15,
            minBitrate: -1,
            minFrameRate: -1,
            mirrorMode: 0,
            orientationMode: 0,
            height: 216,
            width: 288,
        });

        if (mode === FlatRTCMode.Broadcast) {
            this.rtcEngine.setClientRole(role === FlatRTCRole.Host ? 1 : 2);
        }

        this.rtcEngine.enableVideo();
        // prevent camera being turned on temporarily right after joining room
        this.rtcEngine.enableLocalVideo(false);

        if (refreshToken) {
            this._roomSideEffect.add(() => {
                const handler = async (): Promise<void> => {
                    const token = await refreshToken(roomUUID);
                    this.rtcEngine.renewToken(token);
                };
                this.rtcEngine.on("tokenPrivilegeWillExpire", handler);
                return () => this.rtcEngine.off("tokenPrivilegeWillExpire", handler);
            });
        }

        this._roomSideEffect.add(() => {
            let lowVolumeLevelCount = 0;
            const updateVolumeLevels = (speakers: Array<{ uid: number; volume: number }>): void => {
                speakers.forEach(({ uid, volume }) => {
                    volume = volume / 255;

                    if (uid === 0) {
                        const oldVolume = this._volumeLevels.get(0) || 0;
                        this._volumeLevels.set(uid, volume);
                        if (this.uid) {
                            this._volumeLevels.set(this.uid, volume);
                        }

                        if (Math.abs(oldVolume - volume) > 0.00001) {
                            this.events.emit("volume-level-changed", oldVolume);
                        }

                        if (volume <= FlatRTCAgoraElectron.LOW_VOLUME_LEVEL_THRESHOLD) {
                            if (++lowVolumeLevelCount >= 10) {
                                this.events.emit("err-low-volume");
                            }
                        } else {
                            lowVolumeLevelCount = 0;
                        }
                    } else {
                        this._volumeLevels.set(uid, volume);
                    }
                });
            };
            const deleteVolumeLevels = (uid: number): void => {
                this._volumeLevels.delete(uid);
            };

            this.rtcEngine.on("groupAudioVolumeIndication", updateVolumeLevels);
            this.rtcEngine.on("userOffline", deleteVolumeLevels);
            this.rtcEngine.off("userMuteAudio", deleteVolumeLevels);
            return () => {
                this.rtcEngine.off("groupAudioVolumeIndication", updateVolumeLevels);
                this.rtcEngine.off("userOffline", deleteVolumeLevels);
                this.rtcEngine.off("userMuteAudio", deleteVolumeLevels);
            };
        });

        this._roomSideEffect.add(() => {
            const handler = (uid: FlatRTCAgoraElectronUIDType): void => {
                if (isLocalUID(uid)) {
                    return;
                }

                let avatar = this._remoteAvatars.get(uid);
                if (avatar) {
                    avatar.setActive(true);
                } else {
                    avatar = new RTCRemoteAvatar({ rtc: this, uid });
                    this._remoteAvatars.set(uid, avatar);
                }
            };

            this.rtcEngine.on("userJoined", handler);
            return () => this.rtcEngine.off("userJoined", handler);
        });

        this._roomSideEffect.add(() => {
            const handler = (uid: FlatRTCAgoraElectronUIDType): void => {
                if (isLocalUID(uid)) {
                    return;
                }

                const avatar = this._remoteAvatars.get(uid);
                if (avatar) {
                    avatar.destroy();
                    this._remoteAvatars.delete(uid);
                }
            };
            this.rtcEngine.on("userOffline", handler);
            return () => this.rtcEngine.off("userOffline", handler);
        });

        this._roomSideEffect.addDisposer(
            beforeAddListener(this.events, "network", () => {
                let uplink: FlatRTCNetworkQualityType = 0;
                let downlink: FlatRTCNetworkQualityType = 0;
                let delay = NaN;

                const onNetworkQuality = (
                    uplinkQuality: AgoraNetworkQuality,
                    downlinkQuality: AgoraNetworkQuality,
                ): void => {
                    uplink = uplinkQuality;
                    downlink = downlinkQuality;
                    this.events.emit("network", { uplink, downlink, delay });
                };

                const checkDelay = (stats: RtcStats): void => {
                    delay = stats.lastmileDelay;
                    this.events.emit("network", { uplink, downlink, delay });
                };

                this.rtcEngine.on("rtcStats", checkDelay);
                this.rtcEngine.on("networkQuality", onNetworkQuality);
                return () => {
                    this.rtcEngine.off("rtcStats", checkDelay);
                    this.rtcEngine.off("networkQuality", onNetworkQuality);
                };
            }),
        );

        const joinRoomToken = token || (await refreshToken?.(roomUUID));
        if (!joinRoomToken) {
            throw new Error("No join room token provided");
        }

        if (this.rtcEngine.joinChannel(joinRoomToken, roomUUID, "", uid) < 0) {
            throw new Error("[RTC]: join channel failed");
        }

        this.rtcEngine.enableAudioVolumeIndication(500, 3);

        this.uid = uid;
        this.roomUUID = roomUUID;
    }
}

/**
 * @param eventName Event name to listen
 * @param init Runs before adding the first listener of the `eventName`.
 *             Returns a disposer function that runs when the last listener is removed.
 * @returns a disposer function that removes the `listenerAdded` listener.
 */
function beforeAddListener(
    events: Emittery<FlatRTCEventData, FlatRTCEventData>,
    eventName: FlatRTCEventNames,
    init: () => (() => void) | undefined | void,
): () => void {
    let lastCount = events.listenerCount(eventName) || 0;
    let disposer: (() => void) | undefined | void;

    if (lastCount > 0) {
        disposer = init();
    }

    return (events as Emittery<FlatRTCEventData>).on(
        [Emittery.listenerAdded, Emittery.listenerRemoved],
        data => {
            if (data.eventName === eventName) {
                const count = events.listenerCount(eventName) || 0;
                // https://github.com/sindresorhus/emittery/issues/63
                if (lastCount === 0 && count > 0) {
                    disposer = init();
                } else if (lastCount > 0 && count === 0) {
                    disposer?.();
                }
                lastCount = count;
            }
        },
    );
}

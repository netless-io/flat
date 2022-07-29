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
import { RTCShareScreen } from "./rtc-share-screen";

export type FlatRTCAgoraElectronUIDType = number;

export interface FlatRTCAgoraElectronConfig {
    APP_ID: string;
}

export type FlatRTCAgoraElectronJoinRoomConfig =
    FlatRTCJoinRoomConfigBase<FlatRTCAgoraElectronUIDType>;

export interface FlatRTCAgoraElectronDevice {
    devicename: string;
    deviceid: string;
}

export class FlatRTCAgoraElectron extends FlatRTC<
    FlatRTCAgoraElectronUIDType,
    FlatRTCAgoraElectronJoinRoomConfig
> {
    public static APP_ID: string;

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

    public readonly shareScreen = new RTCShareScreen({ rtc: this });

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

    public shareScreenUID?: FlatRTCAgoraElectronUIDType;

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

    public get isJoinedRoom(): boolean {
        return Boolean(this.roomUUID);
    }

    private constructor() {
        super();
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

        this._sideEffect.add(() => {
            const rtcEngine = this.rtcEngine;
            const onError = (_err: number, msg: string): void => {
                this.events.emit("error", new Error(msg));
            };
            rtcEngine.on("error", onError);
            return () => rtcEngine.off("error", onError);
        });

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
        this.shareScreenUID = undefined;
        this.shareScreen.setActive(false);
        this.shareScreen.setParams(null);
    }

    public getAvatar(uid?: FlatRTCAgoraElectronUIDType): FlatRTCAvatar | undefined {
        if (!this.isJoinedRoom) {
            return;
        }
        if (!uid || this.uid === uid) {
            return this.localAvatar;
        }
        if (this.shareScreenUID === uid) {
            throw new Error("getAvatar(shareScreenUID) is not supported.");
        }
        let remoteAvatar = this._remoteAvatars.get(uid);
        if (!remoteAvatar) {
            remoteAvatar = new RTCRemoteAvatar({ rtc: this, uid });
            this._remoteAvatars.set(uid, remoteAvatar);
        }
        return remoteAvatar;
    }

    public getTestAvatar(): FlatRTCAvatar {
        return this.localAvatar;
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

    public getSpeakerVolume(): number {
        return this.rtcEngine.getAudioPlaybackVolume() / 255 || 0;
    }

    public async setSpeakerVolume(volume: number): Promise<void> {
        volume = Math.max(0, Math.min(volume, 1));
        this.rtcEngine.setAudioPlaybackVolume(Math.ceil(volume * 255));
    }

    public startNetworkTest(): void {
        this._sideEffect.add(() => {
            const rtcEngine = this.rtcEngine;
            const handler = (quality: AgoraNetworkQuality): void => {
                this.events.emit("network-test", quality);
            };
            rtcEngine.on("lastMileQuality", handler);
            return () => rtcEngine.off("lastMileQuality", handler);
        }, "network-test");

        this.rtcEngine.startLastmileProbeTest({
            expectedDownlinkBitrate: 100000,
            expectedUplinkBitrate: 100000,
            probeDownlink: true,
            probeUplink: true,
        });
    }

    public stopNetworkTest(): void {
        this.rtcEngine.stopLastmileProbeTest();
        this._sideEffect.flush("network-test");
    }

    public startCameraTest(el: HTMLElement): void {
        this.rtcEngine.enableVideo();

        const avatar = this.localAvatar;
        avatar.setElement(el);
        avatar.enableCamera(true);
        avatar.enableMic(true);

        this.rtcEngine.startPreview();
    }

    public stopCameraTest(): void {
        const avatar = this.localAvatar;
        avatar.setElement(null);
        avatar.enableCamera(false);
        avatar.enableMic(false);

        this.rtcEngine.stopPreview();
        this.rtcEngine.disableVideo();
    }

    public startMicTest(): void {
        this.rtcEngine.startAudioRecordingDeviceTest(300);

        this._sideEffect.add(() => {
            const rtcEngine = this.rtcEngine;
            const handler = (
                _speakers: unknown,
                _speakerNumber: unknown,
                totalVolume: number,
            ): void => {
                this.events.emit("volume-level-changed", totalVolume / 255);
            };
            rtcEngine.on("groupAudioVolumeIndication", handler);
            return () => rtcEngine.off("groupAudioVolumeIndication", handler);
        }, "mic-test");
    }

    public stopMicTest(): void {
        this.rtcEngine.stopAudioRecordingDeviceTest();
        this._sideEffect.flush("mic-test");
    }

    public startSpeakerTest(filePath: string): void {
        this.rtcEngine.enableAudio();
        this.rtcEngine.enableLocalAudio(true);
        this.rtcEngine.startAudioPlaybackDeviceTest(filePath);
    }

    public stopSpeakerTest(): void {
        this.rtcEngine.stopAudioPlaybackDeviceTest();
        this.rtcEngine.enableLocalAudio(false);
        this.rtcEngine.disableAudio();
    }

    private async _join({
        uid,
        token,
        mode,
        refreshToken,
        role,
        roomUUID,
        shareScreenUID,
        shareScreenToken,
    }: FlatRTCAgoraElectronJoinRoomConfig): Promise<void> {
        this.shareScreenUID = shareScreenUID;

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
        this.rtcEngine.enableAudio();
        // prevent camera being turned on temporarily right after joining room
        this.rtcEngine.enableLocalVideo(false);
        this.rtcEngine.enableLocalAudio(false);

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
                if (this.shareScreenUID === uid && this.shareScreen.shouldSubscribeRemoteTrack()) {
                    this.shareScreen.setActive(true);
                    return;
                }
                let avatar = this._remoteAvatars.get(uid);
                if (!avatar) {
                    avatar = new RTCRemoteAvatar({ rtc: this, uid });
                    this._remoteAvatars.set(uid, avatar);
                }
                avatar.setActive(true);
            };

            this.rtcEngine.on("userJoined", handler);
            return () => this.rtcEngine.off("userJoined", handler);
        });

        this._roomSideEffect.add(() => {
            const handler = (uid: FlatRTCAgoraElectronUIDType): void => {
                if (this.shareScreenUID === uid) {
                    this.shareScreen.setActive(false);
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
                    uid: FlatRTCAgoraElectronUIDType,
                    uplinkQuality: AgoraNetworkQuality,
                    downlinkQuality: AgoraNetworkQuality,
                ): void => {
                    if (!uid || uid === this.uid) {
                        uplink = uplinkQuality;
                        downlink = downlinkQuality;
                        this.events.emit("network", { uplink, downlink, delay });
                    }
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
        this.shareScreenUID = shareScreenUID;
        this.shareScreen.setParams({
            roomUUID,
            token: shareScreenToken,
            uid: shareScreenUID,
        });
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

import type AgoraSdk from "agora-electron-sdk";
import type { AgoraNetworkQuality, RtcStats } from "agora-electron-sdk/types/Api/native_type";
import {
    IServiceVideoChat,
    IServiceVideoChatAvatar,
    IServiceVideoChatDevice,
    IServiceVideoChatJoinRoomConfig,
    IServiceVideoChatMode,
    IServiceVideoChatNetworkQualityType,
    IServiceVideoChatRole,
    IServiceVideoChatUID,
} from "@netless/flat-services";
import { SideEffectManager } from "side-effect-manager";
import { RTCRemoteAvatar } from "./rtc-remote-avatar";
import { RTCLocalAvatar } from "./rtc-local-avatar";
import { AgoraRTCElectronShareScreen } from "./rtc-share-screen";

export interface FlatRTCAgoraElectronDevice {
    devicename: string;
    deviceid: string;
}

export interface AgoraRTCElectronConfig {
    APP_ID: string;
    rtcEngine: AgoraSdk;
    isMac: boolean;
}

export class AgoraRTCElectron extends IServiceVideoChat {
    private static LOW_VOLUME_LEVEL_THRESHOLD = 0.00001;

    public readonly isMac: boolean;
    public readonly shareScreen = new AgoraRTCElectronShareScreen({ rtc: this });

    public readonly APP_ID: string;
    public readonly rtcEngine: AgoraSdk;

    private readonly _roomSideEffect = new SideEffectManager();

    private _cameraID?: string;
    private _micID?: string;
    private _speakerID?: string;

    private _mirrorMode = true;

    private uid?: IServiceVideoChatUID;
    private roomUUID?: string;
    private mode?: IServiceVideoChatMode;

    public shareScreenUID?: IServiceVideoChatUID;

    private _volumeLevels = new Map<IServiceVideoChatUID, number>();

    private _remoteAvatars = new Map<IServiceVideoChatUID, RTCRemoteAvatar>();

    public get remoteAvatars(): IServiceVideoChatAvatar[] {
        return [...this._remoteAvatars.values()];
    }

    private _localAvatar?: RTCLocalAvatar;
    public get localAvatar(): IServiceVideoChatAvatar {
        return (this._localAvatar ??= new RTCLocalAvatar({ rtc: this }));
    }

    public get isJoinedRoom(): boolean {
        return Boolean(this.roomUUID);
    }
    private aiUserJoinedHandler?: (user: { uid: number }) => Promise<void>;
    public setRTCEngine(rtcEngine: AgoraSdk): void {
        (this.rtcEngine as AgoraSdk) = rtcEngine;
        this._init(rtcEngine);
    }

    public constructor(config: AgoraRTCElectronConfig) {
        super();
        this.APP_ID = config.APP_ID;
        this.rtcEngine = config.rtcEngine;
        this.isMac = config.isMac;
        this._init(this.rtcEngine);
    }

    private _init(rtcEngine: AgoraSdk): void {
        this.sideEffect.add(() => {
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

        this.sideEffect.add(() => {
            const onError = (_err: number, msg: string): void => {
                this.events.emit("error", new Error(msg));
            };
            rtcEngine.on("error", onError);
            return () => rtcEngine.off("error", onError);
        });

        if (process.env.NODE_ENV === "development") {
            this.sideEffect.add(() => {
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

    public override async destroy(): Promise<void> {
        super.destroy();

        this.sideEffect.flushAll();

        await this.leaveRoom();
    }

    public async joinRoom(config: IServiceVideoChatJoinRoomConfig): Promise<void> {
        if (!this.rtcEngine) {
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
        this._roomSideEffect.flushAll();
        this.uid = undefined;
        this.roomUUID = undefined;
        this.mode = undefined;
        this.shareScreenUID = undefined;
        this.shareScreen.setActive(false);
        this.shareScreen.setParams(null);
    }

    public override getAvatar(uid?: string): IServiceVideoChatAvatar | undefined {
        if (!this.isJoinedRoom) {
            return;
        }
        if (!uid || uid === "0" || this.uid === uid) {
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

    public getTestAvatar(): IServiceVideoChatAvatar {
        return this.localAvatar;
    }

    public stopTesting(): void {
        // do nothing
    }

    public override getVolumeLevel(uid?: IServiceVideoChatUID): number {
        return this._volumeLevels.get(uid || "0") || 0;
    }

    public async setRole(role: IServiceVideoChatRole): Promise<void> {
        if (this.rtcEngine && this.mode === IServiceVideoChatMode.Broadcast) {
            this.rtcEngine.setClientRole(role === IServiceVideoChatRole.Host ? 1 : 2);
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

    public async getCameraDevices(): Promise<IServiceVideoChatDevice[]> {
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

    public async getMicDevices(): Promise<IServiceVideoChatDevice[]> {
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

    public async getSpeakerDevices(): Promise<IServiceVideoChatDevice[]> {
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

    public override getMirrorMode(): boolean {
        return this._mirrorMode;
    }

    public override setMirrorMode(mirrorMode: boolean): void {
        this._mirrorMode = mirrorMode;
        this.rtcEngine.setLocalVideoMirrorMode(mirrorMode ? 1 : 2);
        this._localAvatar?.refreshLocalVideo();
    }

    public override async setSpeakerVolume(volume: number): Promise<void> {
        volume = Math.max(0, Math.min(volume, 1));
        this.rtcEngine.setAudioPlaybackVolume(Math.ceil(volume * 255));
    }

    public override startNetworkTest(): void {
        this.sideEffect.add(() => {
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

    public override stopNetworkTest(): void {
        this.rtcEngine.stopLastmileProbeTest();
        this.sideEffect.flush("network-test");
    }

    public override startCameraTest(el: HTMLElement): void {
        this.rtcEngine.enableVideo();

        const avatar = this.localAvatar;
        avatar.setElement(el);
        avatar.enableCamera(true);
        avatar.enableMic(true);

        this.rtcEngine.startPreview();
    }

    public override stopCameraTest(): void {
        const avatar = this.localAvatar;
        avatar.setElement(null);
        avatar.enableCamera(false);
        avatar.enableMic(false);

        this.rtcEngine.stopPreview();
        this.rtcEngine.disableVideo();
    }

    public override startMicTest(): void {
        this.rtcEngine.startAudioRecordingDeviceTest(300);

        this.sideEffect.add(() => {
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

    public override stopMicTest(): void {
        this.rtcEngine.stopAudioRecordingDeviceTest();
        this.sideEffect.flush("mic-test");
    }

    public override startSpeakerTest(filePath: string): void {
        this.rtcEngine.startAudioPlaybackDeviceTest(filePath);
    }

    public override stopSpeakerTest(): void {
        this.rtcEngine.stopAudioPlaybackDeviceTest();
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
    }: IServiceVideoChatJoinRoomConfig): Promise<void> {
        this._roomSideEffect.flushAll();

        this.shareScreenUID = shareScreenUID;

        const channelProfile = mode === IServiceVideoChatMode.Broadcast ? 1 : 0;
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
            width: 384,
        });

        if (mode === IServiceVideoChatMode.Broadcast) {
            this.rtcEngine.setClientRole(role === IServiceVideoChatRole.Host ? 1 : 2);
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
                        const oldVolume = this._volumeLevels.get("0") || 0;
                        this._volumeLevels.set(String(uid), volume);
                        if (this.uid) {
                            this._volumeLevels.set(this.uid, volume);
                        }

                        if (Math.abs(oldVolume - volume) > 0.00001) {
                            this.events.emit("volume-level-changed", oldVolume);
                        }

                        if (volume <= AgoraRTCElectron.LOW_VOLUME_LEVEL_THRESHOLD) {
                            if (++lowVolumeLevelCount >= 10) {
                                this.events.emit("err-low-volume");
                            }
                        } else {
                            lowVolumeLevelCount = 0;
                        }
                    } else {
                        this._volumeLevels.set(String(uid), volume);
                    }
                });
            };
            const deleteVolumeLevels = (uid: number): void => {
                this._volumeLevels.delete(String(uid));
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
            const handler = (uid_: number): void => {
                const uid: IServiceVideoChatUID = String(uid_);
                if (this.shareScreenUID === uid && this.shareScreen.shouldSubscribeRemoteTrack()) {
                    this.shareScreen.setActive(true);
                    return;
                }
                if (this.aiUserJoinedHandler) {
                    this.aiUserJoinedHandler({ uid: uid_ });
                }
                if (this.aiUserUUId && this.aiUserUUId === uid) {
                    this.rtcEngine.muteRemoteAudioStream(uid_, false);
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
            const handler = (uid_: number): void => {
                const uid: IServiceVideoChatUID = String(uid_);
                if (this.shareScreenUID === uid) {
                    this.shareScreen.setActive(false);
                    return;
                }
                if (this.aiUserUUId && this.aiUserUUId === uid) {
                    this.rtcEngine.muteRemoteAudioStream(uid_, true);
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
            this.events.remit("network", () => {
                let uplink: IServiceVideoChatNetworkQualityType = 0;
                let downlink: IServiceVideoChatNetworkQualityType = 0;
                let delay = NaN;

                const onNetworkQuality = (
                    uid_: number,
                    uplinkQuality: AgoraNetworkQuality,
                    downlinkQuality: AgoraNetworkQuality,
                ): void => {
                    const uid: IServiceVideoChatUID = String(uid_);
                    if (uid === "0" || uid === this.uid) {
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

        if (this.rtcEngine.joinChannel(joinRoomToken, roomUUID, "", Number(uid)) < 0) {
            throw new Error("[RTC]: join channel failed");
        }

        this.rtcEngine.enableAudioVolumeIndication(500, 3);

        this.uid = uid;
        this.roomUUID = roomUUID;
        this.shareScreenUID = shareScreenUID;
        this.mode = mode;
        this.shareScreen.setParams({
            roomUUID,
            token: shareScreenToken,
            uid: shareScreenUID,
        });
    }
    public override listenAIRtcStreamMessage(
        streamMessageHandler: (
            uid: number,
            stream: Uint8Array | number,
            ...arg: any
        ) => Promise<void>,
        userJoinedHandler: (user: { uid: number }) => Promise<void>,
    ): void {
        if (this.rtcEngine) {
            this._roomSideEffect.add(() => {
                this.rtcEngine.on("streamMessage", streamMessageHandler);
                return () => this.rtcEngine.off("streamMessage", streamMessageHandler);
            });
            this.aiUserJoinedHandler = userJoinedHandler;
        }
    }
}

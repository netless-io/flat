import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    NetworkQuality,
} from "agora-rtc-sdk-ng";
import {
    IServiceVideoChat,
    IServiceVideoChatAvatar,
    IServiceVideoChatDevice,
    IServiceVideoChatJoinRoomConfig,
    IServiceVideoChatMode,
    IServiceVideoChatRole,
    IServiceVideoChatUID,
} from "@netless/flat-services";
import { SideEffectManager } from "side-effect-manager";
import { RTCRemoteAvatar } from "./rtc-remote-avatar";
import { RTCLocalAvatar } from "./rtc-local-avatar";
import { AgoraRTCWebShareScreen } from "./rtc-share-screen";

AgoraRTC.enableLogUpload();

if (process.env.PROD) {
    AgoraRTC.setLogLevel(/* WARNING */ 2);
}

if (process.env.DEV) {
    (window as any).AgoraRTC = AgoraRTC;
}

export interface AgoraRTCWebConfig {
    APP_ID: string;
}

export class AgoraRTCWeb extends IServiceVideoChat {
    public readonly APP_ID: string;

    public readonly shareScreen: AgoraRTCWebShareScreen;

    private readonly _roomSideEffect = new SideEffectManager();

    private _pJoiningRoom?: Promise<unknown>;
    private _pLeavingRoom?: Promise<unknown>;

    public client?: IAgoraRTCClient;
    public mode?: IServiceVideoChatMode;

    private _cameraID?: string;
    private _micID?: string;
    private _speakerID?: string;

    private uid?: IServiceVideoChatUID;
    private roomUUID?: string;
    private shareScreenUID?: IServiceVideoChatUID;

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

    public constructor({ APP_ID }: AgoraRTCWebConfig) {
        super();
        this.APP_ID = APP_ID;
        this.shareScreen = new AgoraRTCWebShareScreen({ APP_ID });
        this.sideEffect.add(() => {
            AgoraRTC.onCameraChanged = deviceInfo => {
                if (deviceInfo.state === "ACTIVE") {
                    this.setCameraID(deviceInfo.device.deviceId);
                }
            };
            AgoraRTC.onMicrophoneChanged = deviceInfo => {
                if (deviceInfo.state === "ACTIVE") {
                    this.setMicID(deviceInfo.device.deviceId);
                }
            };
            AgoraRTC.onPlaybackDeviceChanged = deviceInfo => {
                if (deviceInfo.state === "ACTIVE") {
                    this.setSpeakerID(deviceInfo.device.deviceId);
                }
            };
            return () => {
                AgoraRTC.onCameraChanged = undefined;
                AgoraRTC.onMicrophoneChanged = undefined;
                AgoraRTC.onPlaybackDeviceChanged = undefined;
            };
        });
    }

    public override async destroy(): Promise<void> {
        super.destroy();

        this.shareScreen.destroy();

        await this.leaveRoom();
    }

    public async joinRoom(config: IServiceVideoChatJoinRoomConfig): Promise<void> {
        if (!this.APP_ID) {
            throw new Error("APP_ID is not set");
        }

        if (this._pJoiningRoom) {
            await this._pJoiningRoom;
        }
        if (this._pLeavingRoom) {
            await this._pLeavingRoom;
        }

        if (this.client) {
            if (this.roomUUID === config.roomUUID) {
                return;
            }
            await this.leaveRoom();
        }

        this._pJoiningRoom = this._createRTCClient(config);
        await this._pJoiningRoom;
        this._pJoiningRoom = undefined;
    }

    public async leaveRoom(): Promise<void> {
        if (this._pJoiningRoom) {
            await this._pJoiningRoom;
        }
        if (this._pLeavingRoom) {
            await this._pLeavingRoom;
        }

        if (this.client) {
            try {
                this._remoteAvatars.forEach(avatar => avatar.destroy());
                this._remoteAvatars.clear();

                if (this._localAvatar) {
                    this._localAvatar.destroy();
                    this._localAvatar = undefined;
                }

                if (this.localCameraTrack) {
                    this.localCameraTrack.stop();
                    this.localCameraTrack.close();
                    this.localCameraTrack = undefined;
                }
                if (this.localMicTrack) {
                    this.localMicTrack.stop();
                    this.localMicTrack.close();
                    this.localMicTrack = undefined;
                }

                this._roomSideEffect.flushAll();
            } catch (e) {
                // ignored
            }

            this._pLeavingRoom = this.client.leave();
            await this._pLeavingRoom;
            this._pLeavingRoom = undefined;

            this.client = undefined;
            if (process.env.DEV) {
                (window as any).rtc_client = undefined;
            }
            this.mode = undefined;
        }

        this.uid = undefined;
        this.roomUUID = undefined;
        this.shareScreen.setParams(null);
    }

    public getAvatar(uid?: IServiceVideoChatUID): IServiceVideoChatAvatar | undefined {
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
            const rtcRemoteUser = this.client?.remoteUsers.find(user => user.uid === uid);
            remoteAvatar = new RTCRemoteAvatar({ rtcRemoteUser });
            this._remoteAvatars.set(uid, remoteAvatar);
        }
        return remoteAvatar;
    }

    public getTestAvatar(): IServiceVideoChatAvatar {
        return this.localAvatar;
    }

    public getVolumeLevel(uid?: IServiceVideoChatUID): number {
        if (!uid || this.uid === uid) {
            return this._localAvatar?.getVolumeLevel() ?? 0;
        }
        return this._remoteAvatars.get(uid)?.getVolumeLevel() ?? 0;
    }

    public async setRole(role: IServiceVideoChatRole): Promise<void> {
        if (this.client && this.mode === IServiceVideoChatMode.Broadcast) {
            await this.client.setClientRole(
                role === IServiceVideoChatRole.Host ? "host" : "audience",
            );
        }
    }

    public getCameraID(): string | undefined {
        return this._cameraID;
    }

    public async setCameraID(deviceId: string): Promise<void> {
        if (this._cameraID !== deviceId) {
            if (this.localCameraTrack) {
                await this.localCameraTrack.setDevice(deviceId);
            }
            this._cameraID = deviceId;
            this.events.emit("camera-changed", deviceId);
        }
    }

    public async getCameraDevices(): Promise<IServiceVideoChatDevice[]> {
        return (await AgoraRTC.getCameras()).map(device => ({
            deviceId: device.deviceId,
            label: device.label,
        }));
    }

    public getMicID(): string | undefined {
        return this._micID;
    }

    public async setMicID(deviceId: string): Promise<void> {
        if (this._micID !== deviceId) {
            if (this.localMicTrack) {
                await this.localMicTrack.setDevice(deviceId);
            }
            this._micID = deviceId;
            this.events.emit("mic-changed", deviceId);
        }
    }

    public async getMicDevices(): Promise<IServiceVideoChatDevice[]> {
        return (await AgoraRTC.getMicrophones()).map(device => ({
            deviceId: device.deviceId,
            label: device.label,
        }));
    }

    /** Does not support  */
    public getSpeakerID(): string | undefined {
        return this._speakerID;
    }

    public async setSpeakerID(deviceId: string): Promise<void> {
        if (this._speakerID !== deviceId) {
            this._speakerID = deviceId;
            this.events.emit("speaker-changed", deviceId);
        }
    }

    public async getSpeakerDevices(): Promise<IServiceVideoChatDevice[]> {
        return (await AgoraRTC.getPlaybackDevices()).map(device => ({
            deviceId: device.deviceId,
            label: device.label,
        }));
    }

    public getSpeakerVolume(): number {
        return this.getVolumeLevel();
    }

    private async _createRTCClient({
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

        const client = AgoraRTC.createClient({
            mode: mode === IServiceVideoChatMode.Broadcast ? "live" : "rtc",
            codec: "vp8",
        });
        this.client = client;
        this.mode = mode;
        if (process.env.DEV) {
            (window as any).rtc_client = client;
        }

        if (mode === IServiceVideoChatMode.Broadcast) {
            await client.setClientRole(role === IServiceVideoChatRole.Host ? "host" : "audience");
        }

        if (refreshToken) {
            this._roomSideEffect.add(() => {
                const handler = async (): Promise<void> => {
                    const token = await refreshToken(roomUUID);
                    await client.renewToken(token);
                };
                client.on("token-privilege-will-expire", handler);
                return () => client.off("token-privilege-will-expire", handler);
            });
        }

        if (process.env.NODE_ENV === "development") {
            this._roomSideEffect.add(() => {
                const handler = (exception: any): void => {
                    console.log(exception);
                };
                client.on("exception", handler);
                return () => client.off("exception", handler);
            });
        }

        this._roomSideEffect.add(() => {
            const handler = async (
                user: IAgoraRTCRemoteUser,
                mediaType: "audio" | "video",
            ): Promise<void> => {
                const uid = String(user.uid);
                if (this.shareScreenUID === uid) {
                    if (mediaType === "video" && this.shareScreen.shouldSubscribeRemoteTrack()) {
                        try {
                            await client.subscribe(user, mediaType);
                            this.shareScreen.setRemoteVideoTrack(user.videoTrack || null);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return;
                }

                try {
                    await client.subscribe(user, mediaType);
                    let avatar = this._remoteAvatars.get(uid);
                    if (avatar) {
                        if (mediaType === "audio") {
                            avatar.setAudioTrack(user.audioTrack);
                        } else if (mediaType === "video") {
                            avatar.setVideoTrack(user.videoTrack);
                        }
                    } else {
                        avatar = new RTCRemoteAvatar({ rtcRemoteUser: user });
                        this._remoteAvatars.set(uid, avatar);
                    }
                } catch (e) {
                    console.error(e);
                }
            };

            client.on("user-published", handler);
            return () => client.off("user-published", handler);
        });

        this._roomSideEffect.add(() => {
            const handler = async (
                user: IAgoraRTCRemoteUser,
                mediaType: "audio" | "video",
            ): Promise<void> => {
                const uid = String(user.uid);
                if (uid === this.shareScreenUID) {
                    if (mediaType === "video") {
                        try {
                            this.shareScreen.setRemoteVideoTrack(null);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return;
                }

                try {
                    const avatar = this._remoteAvatars.get(uid);
                    if (avatar) {
                        if (mediaType === "audio") {
                            avatar.setAudioTrack(undefined);
                        } else if (mediaType === "video") {
                            avatar.setVideoTrack(undefined);
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            };
            client.on("user-unpublished", handler);
            return () => client.off("user-unpublished", handler);
        });

        this._roomSideEffect.addDisposer(
            this.events.remit("network", () => {
                const handler = ({
                    uplinkNetworkQuality,
                    downlinkNetworkQuality,
                }: NetworkQuality): void => {
                    this.events.emit("network", {
                        uplink: uplinkNetworkQuality,
                        downlink: downlinkNetworkQuality,
                        delay: client.getRTCStats().RTT ?? NaN,
                    });
                };
                client.on("network-quality", handler);
                return () => client.off("network-quality", handler);
            }),
        );

        await client.join(
            this.APP_ID,
            roomUUID,
            token || (await refreshToken?.(roomUUID)) || null,
            Number(uid),
        );

        this.uid = uid;
        this.roomUUID = roomUUID;
        this.shareScreenUID = shareScreenUID;
        this.shareScreen.setParams({
            roomUUID,
            token: shareScreenToken,
            uid: shareScreenUID,
        });
    }

    public localCameraTrack?: ICameraVideoTrack;
    public createLocalCameraTrack = singleRun(async (): Promise<ICameraVideoTrack> => {
        if (!this.localCameraTrack) {
            this.localCameraTrack = await AgoraRTC.createCameraVideoTrack({
                encoderConfig: { width: 288, height: 216 },
                cameraId: this._cameraID,
            });

            if (this._pJoiningRoom) {
                await this._pJoiningRoom;
            }
        }
        return this.localCameraTrack;
    });

    public localMicTrack?: IMicrophoneAudioTrack;
    public createLocalMicTrack = singleRun(async (): Promise<IMicrophoneAudioTrack> => {
        if (!this.localMicTrack) {
            this.localMicTrack = await AgoraRTC.createMicrophoneAudioTrack({
                microphoneId: this._micID,
                // AEC: acoustic echo cancellation
                AEC: true,
                // ANS: automatic noise suppression
                ANS: true,
            });

            if (this._pJoiningRoom) {
                await this._pJoiningRoom;
            }
        }
        return this.localMicTrack;
    });
}

function singleRun<TFn extends (...args: any[]) => Promise<any>>(fn: TFn): TFn {
    let p: any;
    const run = ((...args) => {
        if (!p) {
            p = fn(...args);
            p.then(() => (p = undefined));
        }
        return p;
    }) as TFn;
    return run;
}

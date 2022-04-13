import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    NetworkQuality,
} from "agora-rtc-sdk-ng";
import { FlatRTC, FlatRTCAvatar, FlatRTCEventData, FlatRTCEventNames } from "@netless/flat-rtc";
import { SideEffectManager } from "side-effect-manager";
import { Val } from "value-enhancer";
import Emittery from "emittery";
import { RTCRemoteAvatar } from "./rtc-remote-avatar";
import { RTCLocalAvatar } from "./rtc-local-avatar";
import { FlatRTCAgoraWebJoinRoomConfig, FlatRTCAgoraWebUIDType } from "./types";
import { FlatRTCAgoraWebMode } from "./constants";

AgoraRTC.enableLogUpload();

if (process.env.PROD) {
    AgoraRTC.setLogLevel(/* WARNING */ 2);
}

if (process.env.DEV) {
    (window as any).AgoraRTC = AgoraRTC;
}

export interface FlatRTCAgoraWebConfig {
    APP_ID: string;
}

export type IFlatRTCAgoraWeb = FlatRTC<FlatRTCAgoraWebUIDType, FlatRTCAgoraWebJoinRoomConfig>;

export class FlatRTCAgoraWeb implements IFlatRTCAgoraWeb {
    private readonly APP_ID: string;

    private readonly _sideEffect = new SideEffectManager();
    private readonly _roomSideEffect = new SideEffectManager();

    private _pJoiningRoom?: Promise<unknown>;
    private _pLeavingRoom?: Promise<unknown>;

    public client?: IAgoraRTCClient;

    public readonly cameraID$ = new Val<string | undefined>(undefined);
    public readonly micID$ = new Val<string | undefined>(undefined);

    private uid?: FlatRTCAgoraWebUIDType;
    private roomUUID?: string;

    private _remoteAvatars = new Map<FlatRTCAgoraWebUIDType, RTCRemoteAvatar>();

    public get remoteAvatars(): FlatRTCAvatar[] {
        return [...this._remoteAvatars.values()];
    }

    private _localAvatar?: RTCLocalAvatar;
    public get localAvatar(): FlatRTCAvatar {
        return (this._localAvatar ??= new RTCLocalAvatar({ rtc: this }));
    }

    public readonly events = new Emittery<FlatRTCEventData, FlatRTCEventData>();

    public constructor(config: FlatRTCAgoraWebConfig) {
        this.APP_ID = config.APP_ID;

        this._sideEffect.addDisposer(
            this.cameraID$.reaction(cameraID => {
                if (cameraID && this.localCameraTrack) {
                    this.localCameraTrack.setDevice(cameraID);
                }
            }),
        );
        this._sideEffect.addDisposer(
            this.micID$.reaction(micID => {
                if (micID && this.localMicTrack) {
                    this.localMicTrack.setDevice(micID);
                }
            }),
        );
    }

    public async destroy(): Promise<void> {
        this._sideEffect.flushAll();

        await this.leaveRoom();
    }

    public async joinRoom(config: FlatRTCAgoraWebJoinRoomConfig): Promise<void> {
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
            this._remoteAvatars.forEach(avatar => avatar.destroy());
            this._remoteAvatars.clear();

            if (this._localAvatar) {
                this._localAvatar.destroy();
                this._localAvatar = undefined;
            }

            try {
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
            } catch (e) {
                console.error(e);
            }

            this._roomSideEffect.flushAll();

            this._pLeavingRoom = this.client.leave();
            await this._pLeavingRoom;
            this._pLeavingRoom = undefined;

            this.client = undefined;
        }

        this.uid = undefined;
        this.roomUUID = undefined;
    }

    public getAvatar(uid?: FlatRTCAgoraWebUIDType | null): FlatRTCAvatar | null {
        return (
            (uid && (this.uid === uid ? this.localAvatar : this._remoteAvatars.get(uid))) || null
        );
    }

    public getVolumeLevel(uid: FlatRTCAgoraWebUIDType): number {
        if (this.uid === uid) {
            return this._localAvatar?.getVolumeLevel() ?? 0;
        }
        // @TODO screen share
        return this._remoteAvatars.get(uid)?.getVolumeLevel() ?? 0;
    }

    private async _createRTCClient({
        uid,
        token,
        mode,
        screenShare,
        refreshToken,
        role,
        roomUUID,
    }: FlatRTCAgoraWebJoinRoomConfig): Promise<void> {
        const client = AgoraRTC.createClient({ mode, codec: "vp8" });
        this.client = client;
        if (process.env.DEV) {
            (window as any).rtc_client = client;
        }

        if (mode === FlatRTCAgoraWebMode.Broadcast) {
            await client.setClientRole(role || "audience");
        }

        this._roomSideEffect.add(() => {
            const handler = async (): Promise<void> => {
                const token = await refreshToken(roomUUID);
                await client.renewToken(token);
            };
            client.on("token-privilege-will-expire", handler);
            return () => client.off("token-privilege-will-expire", handler);
        });

        this._roomSideEffect.add(() => {
            const handler = (error: any): void => {
                console.error("RTC Exception:", error);
            };
            client.on("exception", handler);
            return () => client.off("exception", handler);
        });

        this._roomSideEffect.add(() => {
            const handler = async (
                user: IAgoraRTCRemoteUser,
                mediaType: "audio" | "video",
            ): Promise<void> => {
                // @TODO screen share
                if (screenShare) {
                    if (user.uid === screenShare.uid) {
                        // skip screen sharing ui
                        return;
                    }
                }

                try {
                    await client.subscribe(user, mediaType);
                } catch (e) {
                    console.error(e);
                }

                const uid = user.uid as FlatRTCAgoraWebUIDType;
                let avatar = this._remoteAvatars.get(uid);
                if (!avatar) {
                    avatar = new RTCRemoteAvatar({ rtcRemoteUser: user });
                    this._remoteAvatars.set(uid, avatar);
                } else if (avatar instanceof RTCRemoteAvatar) {
                    avatar.updateUser(user);
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
                // @TODO screen share
                if (screenShare) {
                    if (user.uid === screenShare.uid) {
                        // skip screen sharing ui
                        return;
                    }
                }

                try {
                    await this.client?.unsubscribe(user, mediaType);
                } catch (e) {
                    console.error(e);
                }

                const uid = user.uid as FlatRTCAgoraWebUIDType;
                const avatar = this._remoteAvatars.get(uid);
                if (avatar) {
                    avatar.destroy();
                    this._remoteAvatars.delete(uid);
                }
            };
            client.on("user-unpublished", handler);
            return () => client.off("user-unpublished", handler);
        });

        this._roomSideEffect.addDisposer(
            beforeAddListener(this.events, "network", () => {
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

        await client.join(this.APP_ID, roomUUID, token || (await refreshToken(roomUUID)), uid);

        // publish existing tracks after joining channel
        if (this.localCameraTrack) {
            await client.publish(this.localCameraTrack);
        }
        if (this.localMicTrack) {
            await client.publish(this.localMicTrack);
        }

        this.uid = uid;
        this.roomUUID = roomUUID;
    }

    public localCameraTrack?: ICameraVideoTrack;
    public createLocalCameraTrack = singleRun(async (): Promise<ICameraVideoTrack> => {
        if (!this.localCameraTrack) {
            this.localCameraTrack = await AgoraRTC.createCameraVideoTrack({
                encoderConfig: { width: 288, height: 216 },
                cameraId: this.cameraID$.value,
            });

            if (this._pJoiningRoom) {
                await this._pJoiningRoom;
            }

            if (this.client && this.roomUUID) {
                await this.client.publish(this.localCameraTrack);
            }
        }
        return this.localCameraTrack;
    });

    public localMicTrack?: IMicrophoneAudioTrack;
    public createLocalMicTrack = singleRun(async (): Promise<IMicrophoneAudioTrack> => {
        if (!this.localMicTrack) {
            this.localMicTrack = await AgoraRTC.createMicrophoneAudioTrack({
                microphoneId: this.micID$.value,
                // AEC: acoustic echo cancellation
                AEC: true,
                // ANS: automatic noise suppression
                ANS: true,
            });

            if (this._pJoiningRoom) {
                await this._pJoiningRoom;
            }

            if (this.client && this.roomUUID) {
                await this.client.publish(this.localMicTrack);
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

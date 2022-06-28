import type { IAgoraRTCClient, ILocalVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";
import { SideEffectManager } from "side-effect-manager";
import { Val } from "value-enhancer";
import { FlatRTCShareScreen, FlatRTCShareScreenParams } from "@netless/flat-rtc";
import AgoraRTC from "agora-rtc-sdk-ng";
import { FlatRTCAgoraWeb, FlatRTCAgoraWebUIDType } from "./flat-rtc-agora-web";

export type RTCShareScreenParams = FlatRTCShareScreenParams<FlatRTCAgoraWebUIDType>;

export interface RTCShareScreenAvatarConfig {
    element?: HTMLElement | null;
}

// Only play remote screen track on element.
export class RTCShareScreen extends FlatRTCShareScreen {
    private readonly _sideEffect = new SideEffectManager();

    private readonly _params$ = new Val<RTCShareScreenParams | null>(null);
    private readonly _enabled$ = new Val(false);

    private readonly _remoteVideoTrack$ = new Val<IRemoteVideoTrack | null>(null);
    private readonly _el$: Val<HTMLElement | null>;

    public readonly client: IAgoraRTCClient;
    public localVideoTrack: ILocalVideoTrack | null = null;
    public remoteVideoTrack: IRemoteVideoTrack | null = null;

    public constructor(config: RTCShareScreenAvatarConfig = {}) {
        super();

        this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        this._el$ = new Val(config.element ?? null);

        this._sideEffect.addDisposer(
            this._remoteVideoTrack$.subscribe(remoteVideoTrack => {
                if (remoteVideoTrack) {
                    if (this.remoteVideoTrack) {
                        this.remoteVideoTrack.stop();
                    }
                    this.remoteVideoTrack = remoteVideoTrack;
                    if (this._el$.value && !this.localVideoTrack) {
                        this.remoteVideoTrack.play(this._el$.value);
                    }
                    this.events.emit("remote-changed", true);
                } else if (this.remoteVideoTrack) {
                    this.remoteVideoTrack.stop();
                    this.remoteVideoTrack = null;
                    this.events.emit("remote-changed", false);
                }
            }),
        );

        this._sideEffect.addDisposer(
            this._el$.reaction(el => {
                if (el && this.remoteVideoTrack && !this.localVideoTrack) {
                    this.remoteVideoTrack.play(el);
                }
            }),
        );

        this._sideEffect.addDisposer(
            this._enabled$.subscribe(async enabled => {
                if (enabled && this._remoteVideoTrack$.value) {
                    this.events.emit(
                        "err-enable",
                        new Error("There already exists remote screen track."),
                    );
                    return;
                }
                try {
                    if (enabled) {
                        await this.enableShareScreen();
                    } else {
                        await this.disableShareScreen();
                    }
                    this.events.emit("local-changed", enabled);
                } catch (e) {
                    this.events.emit("err-enable", e);
                }
            }),
        );
    }

    public shouldSubscribeRemoteTrack(): boolean {
        return !this._enabled$.value;
    }

    public setRemoteVideoTrack(remoteVideoTrack: IRemoteVideoTrack | null): void {
        this._remoteVideoTrack$.setValue(remoteVideoTrack);
    }

    public setParams(params: RTCShareScreenParams | null): void {
        this._params$.setValue(params);
    }

    public enable(enabled: boolean): void {
        if (enabled && this._remoteVideoTrack$.value) {
            throw new Error("There already exists remote screen track.");
        }
        this._enabled$.setValue(enabled);
    }

    public setElement(element: HTMLElement | null): void {
        this._el$.setValue(element);
    }

    public destroy(): void {
        this._sideEffect.flushAll();
    }

    private _pTogglingShareScreen?: Promise<unknown>;

    public async enableShareScreen(): Promise<ILocalVideoTrack> {
        if (!this._params$.value) {
            throw new Error("Should call joinRoom() before share screen.");
        }

        if (this._pTogglingShareScreen) {
            await this._pTogglingShareScreen;
        }

        if (!this.localVideoTrack) {
            let resolve_EnablingShareScreen!: () => void;
            this._pTogglingShareScreen = new Promise<void>(resolve => {
                resolve_EnablingShareScreen = resolve;
            });

            this.localVideoTrack = await AgoraRTC.createScreenVideoTrack({}, "disable");
            this.localVideoTrack.once("track-ended", () => {
                this.enable(false);
            });

            if (this._params$.value) {
                const { roomUUID, token, uid } = this._params$.value;
                await this.client.join(FlatRTCAgoraWeb.APP_ID, roomUUID, token, uid);
                await this.client.publish(this.localVideoTrack);
            }

            resolve_EnablingShareScreen();
            this._pTogglingShareScreen = undefined;
        }
        return this.localVideoTrack;
    }

    public async disableShareScreen(): Promise<void> {
        if (this._pTogglingShareScreen) {
            await this._pTogglingShareScreen;
        }

        if (this.localVideoTrack) {
            let resolve_DisablingShareScreen!: () => void;
            this._pTogglingShareScreen = new Promise<void>(resolve => {
                resolve_DisablingShareScreen = resolve;
            });

            this.localVideoTrack.close();

            if (this.client) {
                await this.client.unpublish(this.localVideoTrack);
                await this.client.leave();
            }

            resolve_DisablingShareScreen();
            this.localVideoTrack = null;
            this._pTogglingShareScreen = undefined;
        }
    }
}

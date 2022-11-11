import type { IAgoraRTCClient, ILocalVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";
import { SideEffectManager } from "side-effect-manager";
import { Val } from "value-enhancer";
import { IServiceShareScreen, IServiceShareScreenParams } from "@netless/flat-services";
import AgoraRTC from "agora-rtc-sdk-ng";

export interface AgoraRTCWebShareScreenAvatarConfig {
    APP_ID: string;
    element?: HTMLElement | null;
}

// Only play remote screen track on element.
export class AgoraRTCWebShareScreen extends IServiceShareScreen {
    private readonly APP_ID: string;
    private readonly _sideEffect = new SideEffectManager();

    private readonly _params$ = new Val<IServiceShareScreenParams | null>(null);
    private readonly _enabled$ = new Val(false);

    private readonly _remoteVideoTrack$ = new Val<IRemoteVideoTrack | null>(null);
    private readonly _el$: Val<HTMLElement | null>;

    public readonly client: IAgoraRTCClient;
    public localVideoTrack: ILocalVideoTrack | null = null;
    public remoteVideoTrack: IRemoteVideoTrack | null = null;

    public constructor(config: AgoraRTCWebShareScreenAvatarConfig) {
        super();

        this.APP_ID = config.APP_ID;

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
                    if (enabled) {
                        this._resolve_EnablingShareScreen();
                        this._pTogglingShareScreen = undefined;
                        this._enabled$.setValue(!enabled);
                    }
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

    public setParams(params: IServiceShareScreenParams | null): void {
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

    public override async destroy(): Promise<void> {
        this._sideEffect.flushAll();
        await this.disableShareScreen();
    }

    private _pTogglingShareScreen?: Promise<unknown>;
    private _resolve_EnablingShareScreen!: () => void;

    public async enableShareScreen(): Promise<ILocalVideoTrack> {
        if (!this._params$.value) {
            throw new Error("Should call joinRoom() before share screen.");
        }

        if (this._pTogglingShareScreen) {
            await this._pTogglingShareScreen;
        }

        if (!this.localVideoTrack) {
            this._pTogglingShareScreen = new Promise<void>(resolve => {
                this._resolve_EnablingShareScreen = resolve;
            });

            this.localVideoTrack = await AgoraRTC.createScreenVideoTrack({}, "disable");
            this.localVideoTrack.once("track-ended", () => {
                this.enable(false);
            });

            if (this._params$.value) {
                const { roomUUID, token, uid } = this._params$.value;
                await this.client.join(this.APP_ID, roomUUID, token, Number(uid));
                await this.client.publish(this.localVideoTrack);
            }

            this._resolve_EnablingShareScreen();
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

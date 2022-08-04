import { SideEffectManager } from "side-effect-manager";
import { combine, Val } from "value-enhancer";
import type { IServiceVideoChatAvatar, IServiceVideoChatUID } from "@netless/flat-services";
import type { AgoraRTCElectron } from "./agora-rtc-electron";

export interface RTCRemoteAvatarConfig {
    rtc: AgoraRTCElectron;
    uid: IServiceVideoChatUID;
    element?: HTMLElement | null;
}

export class RTCRemoteAvatar implements IServiceVideoChatAvatar {
    private readonly uid: IServiceVideoChatUID;
    private readonly _rtc: AgoraRTCElectron;
    private readonly _sideEffect = new SideEffectManager();

    private readonly _active$ = new Val(false);

    private readonly _shouldCamera$ = new Val(false);
    private readonly _shouldMic$ = new Val(false);

    private readonly _el$: Val<HTMLElement | undefined | null>;

    public setActive(active: boolean): void {
        this._active$.setValue(active);
    }

    public enableCamera(enabled: boolean): void {
        this._shouldCamera$.setValue(enabled);
    }

    public enableMic(enabled: boolean): void {
        this._shouldMic$.setValue(enabled);
    }

    public setElement(el: HTMLElement | null): void {
        this._el$.setValue(el);
    }

    public getVolumeLevel(): number {
        return this._rtc.getVolumeLevel(this.uid) || 0;
    }

    public constructor(config: RTCRemoteAvatarConfig) {
        this._rtc = config.rtc;
        this._el$ = new Val(config.element);
        this.uid = config.uid;

        this._sideEffect.addDisposer(
            combine([this._el$, this._active$]).subscribe(([el, active]) => {
                if (el && active) {
                    try {
                        this._rtc.rtcEngine.setupRemoteVideo(Number(this.uid), el);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }),
        );

        this._sideEffect.addDisposer(
            combine([this._el$, this._active$, this._shouldMic$]).subscribe(
                ([el, active, shouldMic]) => {
                    try {
                        this._rtc.rtcEngine.muteRemoteAudioStream(
                            Number(this.uid),
                            !(el && active && shouldMic),
                        );
                    } catch (e) {
                        console.error(e);
                    }
                },
            ),
        );

        this._sideEffect.addDisposer(
            combine([this._el$, this._active$, this._shouldCamera$]).subscribe(
                ([el, active, shouldCamera]) => {
                    try {
                        this._rtc.rtcEngine.muteRemoteVideoStream(
                            Number(this.uid),
                            !(el && active && shouldCamera),
                        );
                    } catch (e) {
                        console.error(e);
                    }
                },
            ),
        );

        this._sideEffect.addDisposer(() => {
            this._active$.setValue(false);
        });
    }

    public destroy(): void {
        this._sideEffect.flushAll();
    }
}

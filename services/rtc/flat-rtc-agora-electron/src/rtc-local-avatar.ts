import { SideEffectManager } from "side-effect-manager";
import { Val } from "value-enhancer";
import type { FlatRTCAvatar } from "@netless/flat-rtc";
import type { FlatRTCAgoraElectron } from "./flat-rtc-agora-electron";

export interface RTCAvatarConfig {
    rtc: FlatRTCAgoraElectron;
    element?: HTMLElement | null;
}

export class RTCLocalAvatar implements FlatRTCAvatar {
    private readonly _rtc: FlatRTCAgoraElectron;
    private readonly _sideEffect = new SideEffectManager();

    private readonly _shouldCamera$ = new Val(false);
    private readonly _shouldMic$ = new Val(false);

    private readonly _el$: Val<HTMLElement | undefined | null>;

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
        return this._rtc.getVolumeLevel() || 0;
    }

    public constructor(config: RTCAvatarConfig) {
        this._rtc = config.rtc;
        this._el$ = new Val(config.element);

        this._sideEffect.addDisposer(
            this._el$.subscribe(el => {
                try {
                    if (el) {
                        this._rtc.rtcEngine.setupLocalVideo(el);
                        this._rtc.rtcEngine.enableLocalAudio(this._shouldMic$.value);
                        this._rtc.rtcEngine.enableLocalVideo(this._shouldCamera$.value);
                    } else {
                        this._rtc.rtcEngine.enableLocalAudio(false);
                        this._rtc.rtcEngine.enableLocalVideo(false);
                    }
                } catch (e) {
                    console.error(e);
                }
            }),
        );

        this._sideEffect.addDisposer(
            this._shouldMic$.reaction(shouldMic => {
                if (this._el$.value) {
                    try {
                        this._rtc.rtcEngine.enableLocalAudio(shouldMic);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }),
        );

        this._sideEffect.addDisposer(
            this._shouldCamera$.reaction(shouldCamera => {
                if (this._el$.value) {
                    try {
                        this._rtc.rtcEngine.enableLocalVideo(shouldCamera);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }),
        );

        this._sideEffect.addDisposer(() => {
            this._rtc.rtcEngine.enableLocalVideo(false);
            this._rtc.rtcEngine.enableLocalAudio(false);
            this._el$.setValue(null);
        });
    }

    public destroy(): void {
        this._sideEffect.flushAll();
    }
}

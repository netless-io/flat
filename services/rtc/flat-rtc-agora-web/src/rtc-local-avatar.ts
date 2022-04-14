import { SideEffectManager } from "side-effect-manager";
import { Val } from "value-enhancer";
import type { FlatRTCAvatar } from "@netless/flat-rtc";
import type { FlatRTCAgoraWeb } from "./flat-rtc-agora-web";

export interface RTCAvatarConfig {
    rtc: FlatRTCAgoraWeb;
    element?: HTMLElement | null;
}

export class RTCLocalAvatar implements FlatRTCAvatar {
    private readonly _rtc: FlatRTCAgoraWeb;
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
        return this._rtc.localMicTrack?.getVolumeLevel() || 0;
    }

    public constructor(config: RTCAvatarConfig) {
        this._rtc = config.rtc;
        this._el$ = new Val(config.element);

        this._sideEffect.addDisposer(
            this._shouldMic$.subscribe(async shouldMic => {
                try {
                    let localMicTrack = this._rtc.localMicTrack;
                    if (shouldMic && !localMicTrack) {
                        localMicTrack = await this._rtc.createLocalMicTrack();
                    } else if (localMicTrack) {
                        await localMicTrack.setEnabled(shouldMic);
                    }
                } catch (e) {
                    console.error(e);
                }
            }),
        );

        this._sideEffect.addDisposer(
            this._shouldCamera$.subscribe(async shouldCamera => {
                try {
                    let localCameraTrack = this._rtc.localCameraTrack;
                    if (shouldCamera && !localCameraTrack) {
                        localCameraTrack = await this._rtc.createLocalCameraTrack();
                        if (this._el$.value) {
                            localCameraTrack.play(this._el$.value);
                        }
                    } else if (localCameraTrack) {
                        await localCameraTrack.setEnabled(shouldCamera);
                    }
                } catch (e) {
                    console.error(e);
                }
            }),
        );

        this._sideEffect.addDisposer(
            this._el$.reaction(el => {
                if (el && this._rtc.localCameraTrack) {
                    try {
                        this._rtc.localCameraTrack.play(el);
                        this._rtc.localCameraTrack.setEnabled(this._shouldCamera$.value);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }),
        );

        this._sideEffect.addDisposer(() => {
            this._rtc.localCameraTrack?.setEnabled(false);
            this._rtc.localMicTrack?.setEnabled(false);
        });
    }

    public destroy(): void {
        this._sideEffect.flushAll();
    }
}

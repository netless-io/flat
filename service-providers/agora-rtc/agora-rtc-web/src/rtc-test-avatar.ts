import { IServiceVideoChatAvatar } from "@netless/flat-services";
import { SideEffectManager } from "side-effect-manager";
import { Val } from "value-enhancer";
import { AgoraRTCWeb } from "./agora-rtc-web";

export interface RTCAvatarConfig {
    rtc: AgoraRTCWeb;
    element?: HTMLElement | null;
}

export class RTCTestAvatar implements IServiceVideoChatAvatar {
    private static LOW_VOLUME_LEVEL_THRESHOLD = 0.00001;

    /** Stop doing anything when it is false */
    public enabled = false;

    private readonly _rtc: AgoraRTCWeb;
    private readonly _sideEffect = new SideEffectManager();

    private readonly _shouldCamera$ = new Val(false);
    private readonly _shouldMic$ = new Val(false);

    private _volumeLevel = 0;

    private readonly _el$: Val<HTMLElement | undefined | null>;

    private readonly _mirrorMode$: Val<boolean> = new Val(true);

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
        return this._volumeLevel;
    }

    public enableMirrorMode(enabled: boolean): void {
        this._mirrorMode$.setValue(enabled);
    }

    public constructor(config: RTCAvatarConfig) {
        this._rtc = config.rtc;
        this._el$ = new Val(config.element);
        this._sideEffect.addDisposer(
            this._shouldMic$.subscribe(async shouldMic => {
                this._volumeLevel = 0;

                try {
                    let localMicTrack = this._rtc.localMicTrack;
                    if (shouldMic && !localMicTrack) {
                        localMicTrack = await this._rtc.createLocalMicTrack();
                    }
                    if (!this.enabled) {
                        return;
                    }

                    if (localMicTrack) {
                        await localMicTrack.setEnabled(shouldMic);
                    }
                    if (!this.enabled) {
                        return;
                    }

                    const lowVolumeLevelDisposerID = "local-mic-volume-level";
                    if (shouldMic) {
                        let lowVolumeLevelCount = 0;
                        this._sideEffect.setInterval(
                            () => {
                                if (this._rtc.localMicTrack) {
                                    try {
                                        const volumeLevel =
                                            this._rtc.localMicTrack.getVolumeLevel() || 0;
                                        if (Math.abs(this._volumeLevel - volumeLevel) > 0.00001) {
                                            this._volumeLevel = volumeLevel;
                                            this._rtc.events.emit(
                                                "volume-level-changed",
                                                volumeLevel,
                                            );
                                        }
                                        if (
                                            volumeLevel <= RTCTestAvatar.LOW_VOLUME_LEVEL_THRESHOLD
                                        ) {
                                            if (++lowVolumeLevelCount >= 10) {
                                                this._rtc.events.emit("err-low-volume");
                                                this._sideEffect.flush(lowVolumeLevelDisposerID);
                                                return;
                                            }
                                        } else {
                                            lowVolumeLevelCount = 0;
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }
                            },
                            500,
                            lowVolumeLevelDisposerID,
                        );
                    } else {
                        this._sideEffect.flush(lowVolumeLevelDisposerID);
                    }
                } catch (e) {
                    this._rtc.events.emit("err-set-mic", e);
                }
            }),
        );

        this._sideEffect.addDisposer(
            this._shouldCamera$.subscribe(async shouldCamera => {
                try {
                    let localCameraTrack = this._rtc.localCameraTrack;
                    if (shouldCamera && !localCameraTrack) {
                        localCameraTrack = await this._rtc.createLocalCameraTrack();
                        if (!this.enabled) {
                            return;
                        }
                        if (this._el$.value) {
                            localCameraTrack.play(this._el$.value, {
                                mirror: this._mirrorMode$.value,
                            });
                        }
                    }
                    if (localCameraTrack) {
                        await localCameraTrack.setEnabled(shouldCamera);
                    }
                } catch (e) {
                    this._rtc.events.emit("err-set-camera", e);
                }
            }),
        );

        this._sideEffect.addDisposer(
            this._el$.reaction(async el => {
                if (el && this._rtc.localCameraTrack) {
                    try {
                        this._rtc.localCameraTrack.play(el, {
                            mirror: this._mirrorMode$.value,
                        });
                        await this._rtc.localCameraTrack.setEnabled(this._shouldCamera$.value);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }),
        );

        this._sideEffect.addDisposer(
            this._mirrorMode$.reaction(async mirrorMode => {
                if (this._el$.value && this._rtc.localCameraTrack?.isPlaying) {
                    try {
                        this._rtc.localCameraTrack.stop();
                        this._rtc.localCameraTrack.play(this._el$.value, { mirror: mirrorMode });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }),
        );

        this._sideEffect.addDisposer(async () => {
            try {
                await this._rtc.localCameraTrack?.setEnabled(false);
                await this._rtc.localMicTrack?.setEnabled(false);
            } catch {
                // do nothing
            }
        });

        this.enableMirrorMode(this._rtc.getMirrorMode());
    }

    public destroy(): void {
        this._sideEffect.flushAll();
    }
}

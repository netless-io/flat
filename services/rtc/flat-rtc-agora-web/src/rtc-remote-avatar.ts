import { SideEffectManager } from "side-effect-manager";
import { combine, Val } from "value-enhancer";
import type { IServiceVideoChatAvatar } from "@netless/flat-services";
import type { IAgoraRTCRemoteUser, IRemoteAudioTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";

export interface RTCRemoteAvatarConfig {
    rtcRemoteUser?: IAgoraRTCRemoteUser;
    element?: HTMLElement | null;
}

export class RTCRemoteAvatar implements IServiceVideoChatAvatar {
    private readonly _sideEffect = new SideEffectManager();

    private readonly _shouldCamera$ = new Val(false);
    private readonly _shouldMic$ = new Val(false);

    private readonly _el$: Val<HTMLElement | undefined | null>;
    private readonly _videoTrack$: Val<IRemoteVideoTrack | undefined>;
    private readonly _audioTrack$: Val<IRemoteAudioTrack | undefined>;

    public enableCamera(enabled: boolean): void {
        this._shouldCamera$.setValue(enabled);
    }

    public enableMic(enabled: boolean): void {
        this._shouldMic$.setValue(enabled);
    }

    public setElement(el: HTMLElement | null): void {
        this._el$.setValue(el);
    }

    public setVideoTrack(videoTrack?: IRemoteVideoTrack): void {
        this._videoTrack$.setValue(videoTrack);
    }

    public setAudioTrack(audioTrack?: IRemoteAudioTrack): void {
        this._audioTrack$.setValue(audioTrack);
    }

    public getVolumeLevel(): number {
        return this._audioTrack$.value?.getVolumeLevel() || 0;
    }

    public constructor(config: RTCRemoteAvatarConfig = {}) {
        this._el$ = new Val(config.element);
        this._videoTrack$ = new Val(config.rtcRemoteUser?.videoTrack);
        this._audioTrack$ = new Val(config.rtcRemoteUser?.audioTrack);

        this._sideEffect.addDisposer(
            combine([this._audioTrack$, this._shouldMic$]).subscribe(([audioTrack, shouldMic]) => {
                this._sideEffect.add(() => {
                    let disposer = (): void => void 0;
                    if (audioTrack) {
                        try {
                            if (shouldMic) {
                                if (!audioTrack.isPlaying) {
                                    audioTrack.play();
                                    // dispose this track on next track update
                                    disposer = () => audioTrack.stop();
                                }
                            } else {
                                if (audioTrack.isPlaying) {
                                    audioTrack.stop();
                                }
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return disposer;
                }, "audio-track");
            }),
        );

        this._sideEffect.addDisposer(
            combine([this._el$, this._videoTrack$, this._shouldCamera$]).subscribe(
                ([el, videoTrack, shouldCamera]) => {
                    this._sideEffect.add(() => {
                        let disposer = (): void => void 0;
                        if (el && videoTrack) {
                            try {
                                if (shouldCamera) {
                                    if (!videoTrack.isPlaying) {
                                        videoTrack.play(el);
                                        // dispose this track on next track update
                                        disposer = () => videoTrack.stop();
                                    }
                                } else {
                                    if (videoTrack.isPlaying) {
                                        videoTrack.stop();
                                    }
                                }
                            } catch (e) {
                                console.error(e);
                            }
                        }
                        return disposer;
                    }, "video-track");
                },
            ),
        );
    }

    public destroy(): void {
        this._sideEffect.flushAll();

        try {
            this._videoTrack$.value?.stop();
            this._audioTrack$.value?.stop();
        } catch (e) {
            console.error(e);
        }

        this._videoTrack$.setValue(undefined);
        this._audioTrack$.setValue(undefined);
    }
}

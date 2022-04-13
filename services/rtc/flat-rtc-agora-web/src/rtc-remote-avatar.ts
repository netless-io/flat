import { SideEffectManager } from "side-effect-manager";
import { combine, Val } from "value-enhancer";
import type { FlatRTCAvatar } from "@netless/flat-rtc";
import type { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

export interface RTCRemoteAvatarConfig {
    rtcRemoteUser: IAgoraRTCRemoteUser;
    element?: HTMLElement | null;
}

export class RTCRemoteAvatar implements FlatRTCAvatar {
    private readonly _sideEffect = new SideEffectManager();

    private readonly _shouldCamera$ = new Val(false);
    private readonly _shouldMic$ = new Val(false);

    private readonly _el$: Val<HTMLElement | undefined | null>;
    private readonly _user$: Val<IAgoraRTCRemoteUser>;

    public enableCamera(enabled: boolean): void {
        this._shouldCamera$.setValue(enabled);
    }

    public enableMic(enabled: boolean): void {
        this._shouldMic$.setValue(enabled);
    }

    public setElement(el: HTMLElement | null): void {
        this._el$.setValue(el);
    }

    public updateUser(rtcRemoteUser: IAgoraRTCRemoteUser): void {
        this._user$.setValue(rtcRemoteUser);
    }

    public getVolumeLevel(): number {
        return this._user$.value.audioTrack?.getVolumeLevel() || 0;
    }

    public constructor(config: RTCRemoteAvatarConfig) {
        this._el$ = new Val(config.element);
        this._user$ = new Val(config.rtcRemoteUser);

        this._sideEffect.addDisposer(
            combine([this._user$, this._shouldMic$]).subscribe(([user, shouldMic]) => {
                if (user.audioTrack) {
                    try {
                        if (shouldMic) {
                            user.audioTrack.play();
                        } else {
                            user.audioTrack.stop();
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }),
        );

        this._sideEffect.addDisposer(
            combine([this._el$, this._user$, this._shouldCamera$]).subscribe(
                ([el, user, shouldCamera]) => {
                    if (el && user.videoTrack) {
                        try {
                            if (shouldCamera) {
                                user.videoTrack.play(el);
                            } else {
                                user.videoTrack.stop();
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                },
            ),
        );

        this._sideEffect.addDisposer(() => {
            const { videoTrack, audioTrack } = this._user$.value;
            try {
                videoTrack?.stop();
                audioTrack?.stop();
            } catch (e) {
                console.error(e);
            }
        });
    }

    public destroy(): void {
        this._sideEffect.flushAll();
    }
}

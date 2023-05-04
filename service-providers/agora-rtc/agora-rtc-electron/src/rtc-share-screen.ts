import {
    IServiceShareScreen,
    IServiceShareScreenInfo,
    IServiceShareScreenParams,
} from "@netless/flat-services";
import type AgoraRtcEngine from "agora-electron-sdk";
import type {
    DisplayInfo,
    ScreenSymbol,
    WindowInfo,
} from "agora-electron-sdk/types/Api/native_type";
import type { AgoraRTCElectron } from "./agora-rtc-electron";

import { SideEffectManager } from "side-effect-manager";
import { combine, Val } from "value-enhancer";
import { RTCLocalAvatar } from "./rtc-local-avatar";

const rect = { x: 0, y: 0, width: 0, height: 0 };

const videoSourceParams = {
    width: 0,
    height: 0,
    bitrate: 0,
    frameRate: 15,
    captureMouseCursor: true,
    windowFocus: false,
    excludeWindowList: [],
    excludeWindowCount: 0,
};

export interface AgoraRTCElectronShareScreenAvatarConfig {
    rtc: AgoraRTCElectron;
    element?: HTMLElement | null;
}

export class AgoraRTCElectronShareScreen extends IServiceShareScreen {
    private readonly _rtc: AgoraRTCElectron;
    private readonly _sideEffect = new SideEffectManager();

    private readonly _params$ = new Val<IServiceShareScreenParams | null>(null);
    private readonly _enabled$ = new Val(false);

    private readonly _active$ = new Val(false);
    private readonly _el$: Val<HTMLElement | null>;

    private readonly _screenInfo$ = new Val<IServiceShareScreenInfo | null>(null);

    private _speakerName?: string;

    public constructor(config: AgoraRTCElectronShareScreenAvatarConfig) {
        super();

        this._rtc = config.rtc;
        this._el$ = new Val(config.element ?? null);

        this._sideEffect.addDisposer(
            combine([this._active$, this._params$, this._el$]).subscribe(([active, params, el]) => {
                if (el && params) {
                    const uid = Number(params.uid);
                    try {
                        if (active) {
                            // this is a bug in agora SDK, when the `desktop` screen sharing is done,
                            // and then the `web` side does the screen sharing,
                            // the `desktop` will have a black screen.
                            // this is because the SDK has `mute` the remote screen sharing stream
                            this.client.muteRemoteVideoStream(uid, false);
                            this.client.muteRemoteAudioStream(uid, false);
                            this.client.setupRemoteVideo(uid, el);
                            this.client.setupViewContentMode(uid, 1, undefined);
                        } else {
                            this.client.destroyRender(uid, undefined);
                            this.client.destroyRenderView(uid, undefined, el);
                        }
                        this.events.emit("remote-changed", active);
                    } catch (e) {
                        console.error(e);
                    }
                }
                this.events.emit("remote-changed", active);
            }),
        );

        this._sideEffect.addDisposer(
            combine([this._screenInfo$, this._enabled$]).subscribe(
                async ([screenInfo, enabled]) => {
                    try {
                        if (screenInfo && enabled) {
                            await this.enableShareScreen(screenInfo);
                        } else {
                            await this.disableShareScreen();
                        }
                        this.events.emit("local-changed", enabled);
                    } catch (e) {
                        this.events.emit("err-enable", e);
                    }
                },
            ),
        );
    }

    public get client(): AgoraRtcEngine {
        return this._rtc.rtcEngine;
    }

    public shouldSubscribeRemoteTrack(): boolean {
        return !this._enabled$.value;
    }

    public setActive(active: boolean): void {
        this._active$.setValue(active);
    }

    public setParams(params: IServiceShareScreenParams | null): void {
        this._params$.setValue(params);
    }

    public override async getScreenInfo(): Promise<IServiceShareScreenInfo[]> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const displayList = await new Promise<DisplayInfo[]>(res =>
            this.client.getScreenDisplaysInfo(res),
        );
        const windowList = await new Promise<WindowInfo[]>(res =>
            this.client.getScreenWindowsInfo(res),
        );

        const convertScreenInfo = (
            info: DisplayInfo | WindowInfo,
        ): IServiceShareScreenInfo | null => {
            // There's a bug in agora SDK, the image may be missing on mirrored screen
            if (!info.image) {
                return null;
            }
            if ("displayId" in info) {
                return {
                    type: "display",
                    screenId: info.displayId,
                    name: "Desktop",
                    image: info.image,
                    width: info.width,
                    height: info.height,
                };
            } else {
                return {
                    type: "window",
                    screenId: info.windowId,
                    name: `${info.ownerName} - ${info.name}`,
                    image: info.image,
                    // There's no other way to get the original window size :/
                    width: info.originWidth,
                    height: info.originHeight,
                };
            }
        };

        return compact([
            ...displayList.map(convertScreenInfo),
            ...windowList.map(convertScreenInfo),
        ]);
    }

    public override setScreenInfo(info: IServiceShareScreenInfo | null): void {
        this._screenInfo$.setValue(info);
    }

    public enable(enabled: boolean, speakerName?: string): void {
        if (this._el$.value && this._active$.value) {
            throw new Error("There already exists remote screen track.");
        }
        this._speakerName = speakerName;
        this._enabled$.setValue(enabled);
    }

    public setElement(element: HTMLElement | null): void {
        this._el$.setValue(element);
    }

    public override async destroy(): Promise<void> {
        super.destroy();
        this._sideEffect.flushAll();
    }

    private _pTogglingShareScreen?: Promise<unknown>;
    private _lastEnabled = false;

    public async enableShareScreen(screenInfo: IServiceShareScreenInfo): Promise<void> {
        if (!this._params$.value) {
            throw new Error("Should call joinRoom() before share screen.");
        }

        if (this._lastEnabled === true) {
            return;
        }
        this._lastEnabled = true;

        if (this._pTogglingShareScreen) {
            await this._pTogglingShareScreen;
        }

        const { roomUUID, token, uid } = this._params$.value;

        const speakerName = this._speakerName;

        this._pTogglingShareScreen = new Promise<void>(resolve => {
            this.client.once("videoSourceJoinedSuccess", () => {
                if (speakerName) {
                    this._delegateLocalAudio(true);
                    this.client.enableLoopbackRecording(true, speakerName);
                }

                this.client.videoSourceSetVideoProfile(43, false);
                if (screenInfo.type === "display") {
                    this.client.videoSourceStartScreenCaptureByScreen(
                        screenInfo.screenId as ScreenSymbol,
                        rect,
                        videoSourceParams,
                    );
                } else {
                    this.client.videoSourceStartScreenCaptureByWindow(
                        screenInfo.screenId as number,
                        rect,
                        videoSourceParams,
                    );
                }
                resolve();
            });
            this.client.videoSourceSetScreenCaptureScenario(2);
            this.client.videoSourceInitialize(this._rtc.APP_ID);
            this.client.videoSourceSetChannelProfile(1);
            this.client.videoSourceJoin(token, roomUUID, "", Number(uid), {
                publishLocalAudio: false,
                publishLocalVideo: true,
                autoSubscribeAudio: false,
                autoSubscribeVideo: false,
            });
            this.client.videoSourceMuteAllRemoteAudioStreams(true);
            this.client.videoSourceMuteAllRemoteVideoStreams(true);
        });
        await this._pTogglingShareScreen;
        this._pTogglingShareScreen = undefined;
    }

    public async disableShareScreen(): Promise<void> {
        if (this._pTogglingShareScreen) {
            await this._pTogglingShareScreen;
        }

        if (this._lastEnabled === false) {
            return;
        }
        this._lastEnabled = false;

        this._pTogglingShareScreen = new Promise<void>(resolve => {
            this._delegateLocalAudio(false);
            this.client.adjustRecordingSignalVolume(100);
            this.client.adjustLoopbackRecordingSignalVolume(0);
            this.client.enableLoopbackRecording(false);
            this.client.stopScreenCapture2();
            this.client.once("videoSourceLeaveChannel", () => {
                this.client.videoSourceRelease();
                resolve();
            });
            this.client.videoSourceLeave();
        });
        await this._pTogglingShareScreen;
        this._pTogglingShareScreen = undefined;
    }

    private _stopDelegateLocalAudio: (() => void) | null = null;
    private _delegateLocalAudio(enabled: boolean): void {
        this._stopDelegateLocalAudio && this._stopDelegateLocalAudio();
        const localAvatar = this._rtc.localAvatar as RTCLocalAvatar;
        if (enabled) {
            this._rtc.rtcEngine.enableLocalAudio(true);
            this._stopDelegateLocalAudio = localAvatar.delegateLocalAudio({
                enableLocalAudio: enabled => {
                    this.client.adjustRecordingSignalVolume(enabled ? 100 : 0);
                    this.client.adjustLoopbackRecordingSignalVolume(100);
                },
            });
        } else {
            this._stopDelegateLocalAudio = null;
        }
    }
}

type Truthy<T> = T extends false | "" | 0 | null | undefined ? never : T;

function compact<T>(arr: T[]): Array<Truthy<T>> {
    return arr.filter(Boolean) as Array<Truthy<T>>;
}

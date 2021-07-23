import "video.js/dist/video-js.css";

import CombinePlayerFactory, { CombinePlayer, PublicCombinedStatus } from "@netless/combine-player";
import { CursorTool } from "@netless/cursor-tool";
import {
    PluginId as VideoJsPluginId,
    videoJsPlugin,
    PluginContext as VideoJsPluginContext,
} from "@netless/video-js-plugin";
import { EventEmitter } from "eventemitter3";
import polly from "polly-js";
import {
    createPlugins,
    PlayableCheckingParams,
    Player,
    PlayerPhase,
    ReplayRoomParams,
    WhiteWebSdk,
} from "white-web-sdk";
import { Region } from "flat-components";
import { NETLESS, NODE_ENV } from "../constants/Process";

export enum SmartPlayerEventType {
    Ready = "Ready",
    Play = "Play",
    Pause = "Pause",
    Ended = "Ended",
    Error = "Error",
}

export type SmartPlayerEvents = {
    [SmartPlayerEventType.Ready]: void;
    [SmartPlayerEventType.Play]: void;
    [SmartPlayerEventType.Pause]: void;
    [SmartPlayerEventType.Ended]: void;
    [SmartPlayerEventType.Error]: Error;
};

export declare interface SmartPlayer {
    on<U extends keyof SmartPlayerEvents>(
        event: U,
        listener: (value: SmartPlayerEvents[U]) => void,
    ): this;
    once<U extends keyof SmartPlayerEvents>(
        event: U,
        listener: (value: SmartPlayerEvents[U]) => void,
    ): this;
}

/**
 * 智能播放画板与音视频，同时适应有无视频的情况
 */
// eslint-disable-next-line no-redeclare
export class SmartPlayer extends EventEmitter<SmartPlayerEventType> {
    public whiteboardPlayer: Player | undefined;
    public combinePlayer: CombinePlayer | undefined;
    public whiteWebSdk: WhiteWebSdk | undefined;

    public get isPlaying(): boolean {
        return this._isPlaying;
    }

    public get isReady(): boolean {
        return this._isReady;
    }

    public get isEnded(): boolean {
        return this._isEnded;
    }

    public async load({
        whiteboardUUID,
        whiteboardRoomToken,
        region,
        whiteboardEl,
        videoEl,
        recording,
    }: {
        roomUUID: string;
        isCreator: boolean;
        whiteboardUUID: string;
        whiteboardRoomToken: string;
        region?: Region;
        whiteboardEl: HTMLDivElement;
        videoEl: HTMLVideoElement;
        recording?: {
            beginTime: number;
            endTime: number;
            videoURL?: string;
        };
    }): Promise<void> {
        this._isPlaying = false;
        this._isReady = false;
        this._isEnded = false;
        this.destroy();

        const plugins = createPlugins({ [VideoJsPluginId]: videoJsPlugin() });
        const videoJsPluginContext: Partial<VideoJsPluginContext> = { verbose: true };
        plugins.setPluginContext(VideoJsPluginId, videoJsPluginContext);

        const whiteWebSdk = new WhiteWebSdk({
            appIdentifier: NETLESS.APP_IDENTIFIER,
            plugins: plugins,
            region,
        });

        this.whiteWebSdk = whiteWebSdk;

        const rangeQuery: PlayableCheckingParams = {
            room: whiteboardUUID,
            roomToken: whiteboardRoomToken,
            region,
        };

        if (recording) {
            rangeQuery.beginTimestamp = recording.beginTime;
            rangeQuery.duration = recording.endTime - rangeQuery.beginTimestamp;
        }

        await polly()
            .waitAndRetry(30)
            .executeForPromise(async (): Promise<void> => {
                const replayState = await whiteWebSdk.isPlayable(rangeQuery);
                if (!replayState) {
                    return Promise.reject("Whiteboard is not playable");
                }
            });

        const cursorAdapter = new CursorTool();

        const replayRoomParams: ReplayRoomParams = {
            room: whiteboardUUID,
            roomToken: whiteboardRoomToken,
            cursorAdapter: cursorAdapter,
            region,
        };

        if (recording) {
            replayRoomParams.beginTimestamp = recording.beginTime;
            replayRoomParams.duration = recording.endTime - replayRoomParams.beginTimestamp;
        }

        const player = await whiteWebSdk.replayRoom(replayRoomParams, {
            onLoadFirstFrame: () => {
                cursorAdapter.setPlayer(player);
            },
            onPhaseChanged: phase => {
                if (this.combinePlayer) {
                    // 让 combinePlayer 掌管
                    return;
                }
                switch (phase) {
                    case PlayerPhase.Playing: {
                        this._isPlaying = true;
                        this._isEnded = false;
                        this.emit(SmartPlayerEventType.Play);
                        if (NODE_ENV === "development") {
                            console.log("SmartPlayer: start playing");
                        }
                        break;
                    }
                    case PlayerPhase.Pause: {
                        this._isPlaying = false;
                        this.emit(SmartPlayerEventType.Pause);
                        if (NODE_ENV === "development") {
                            console.log("SmartPlayer: paused");
                        }
                        break;
                    }
                    case PlayerPhase.Ended:
                    case PlayerPhase.Stopped: {
                        this._isPlaying = false;
                        this._isEnded = true;
                        this.emit(SmartPlayerEventType.Ended);
                        if (NODE_ENV === "development") {
                            console.log("SmartPlayer: ended");
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            },
            onStoppedWithError: (error: Error) => {
                this.emit(SmartPlayerEventType.Error, error);
            },
        });

        cursorAdapter.setPlayer(player);

        player.bindHtmlElement(whiteboardEl);

        this.whiteboardPlayer = player;

        if (recording?.videoURL) {
            const combinePlayerFactory = new CombinePlayerFactory(player, {
                url: recording.videoURL,
                videoDOM: videoEl,
            });

            const combinePlayer = combinePlayerFactory.create();

            combinePlayer.setOnStatusChange(status => {
                switch (status) {
                    case PublicCombinedStatus.Playing: {
                        this._isPlaying = true;
                        this._isEnded = false;
                        this.emit(SmartPlayerEventType.Play);
                        if (NODE_ENV === "development") {
                            console.log("SmartPlayer: start playing");
                        }
                        break;
                    }
                    case PublicCombinedStatus.Pause: {
                        this._isPlaying = false;
                        this.emit(SmartPlayerEventType.Pause);
                        if (NODE_ENV === "development") {
                            console.log("SmartPlayer: paused");
                        }
                        break;
                    }
                    case PublicCombinedStatus.Ended: {
                        this._isPlaying = false;
                        this._isEnded = true;
                        this.emit(SmartPlayerEventType.Ended);
                        if (NODE_ENV === "development") {
                            console.log("SmartPlayer: ended");
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });

            this.combinePlayer = combinePlayer;
        }

        this._isReady = true;
        this.emit(SmartPlayerEventType.Ready);
        if (NODE_ENV === "development") {
            console.log("SmartPlayer: ready");
        }

        if (NODE_ENV === "development") {
            // 供便捷调试
            (window as any).player = player;
            (window as any).combinePlayer = this.combinePlayer;
        }
    }

    public play(): void {
        if (this._isPlaying) {
            return;
        }
        const whiteboardPlayer = this.checkWhiteboardLoaded();
        if (this.combinePlayer) {
            this.combinePlayer.play();
        } else {
            whiteboardPlayer.play();
        }
    }

    public playBackRate(rate: number): void {
        const whiteboardPlayer = this.checkWhiteboardLoaded();
        if (this.combinePlayer) {
            this.combinePlayer.playbackRate = rate;
        } else {
            whiteboardPlayer.playbackSpeed = rate;
        }
    }

    public pause(): void {
        if (!this._isPlaying) {
            return;
        }
        const whiteboardPlayer = this.checkWhiteboardLoaded();
        if (this.combinePlayer) {
            this.combinePlayer.pause();
        } else {
            whiteboardPlayer.pause();
        }
    }

    public seek(ms: number): void {
        this._isEnded = false;
        const whiteboardPlayer = this.checkWhiteboardLoaded();
        if (this.combinePlayer) {
            this.combinePlayer.seek(ms);
        } else {
            whiteboardPlayer.seekToProgressTime(ms);
        }
    }

    public destroy(): void {
        this.whiteWebSdk = undefined;
        if (this._isPlaying) {
            this.whiteboardPlayer?.stop();
            this.combinePlayer?.pause();
        }
        if (this.whiteboardPlayer) {
            this.whiteboardPlayer.callbacks.off();
        }
        this.combinePlayer?.removeAllStatusChange();
        this.whiteboardPlayer = undefined;
        this.combinePlayer = undefined;

        if (NODE_ENV === "development") {
            (window as any).player = null;
            (window as any).combinePlayer = null;
        }
    }

    private _isPlaying = false;

    private _isReady = false;

    private _isEnded = false;

    private checkWhiteboardLoaded(): Player {
        if (!this.whiteboardPlayer) {
            throw new Error("Whiteboard Player not loaded. Call `smartPlayer.load()` first.");
        }
        return this.whiteboardPlayer;
    }
}

export default SmartPlayer;

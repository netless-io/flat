import { CursorTool } from "@netless/cursor-tool";
import polly from "polly-js";
import {
    WhiteWebSdk,
    PlayerPhase,
    Player,
    createPlugins,
    ReplayRoomParams,
    PlayableCheckingParams,
} from "white-web-sdk";
import CombinePlayerFactory, { CombinePlayer, PublicCombinedStatus } from "@netless/combine-player";
import { videoPlugin } from "@netless/white-video-plugin";
import { audioPlugin } from "@netless/white-audio-plugin";
import { netlessWhiteboardApi } from "./index";
import { NETLESS, NODE_ENV } from "../constants/Process";
import { getRoom, Identity } from "../utils/localStorage/room";

/**
 * 智能播放画板与音视频，同时适应有无视频的情况
 */
export class SmartPlayer {
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
        uuid,
        identity,
        whiteboardEl,
        videoEl,
    }: {
        uuid: string;
        identity: Identity;
        whiteboardEl: HTMLDivElement;
        videoEl: HTMLVideoElement;
    }): Promise<void> {
        this._isPlaying = false;
        this._isReady = false;
        this._isEnded = false;
        this.destroy();

        const roomToken = await netlessWhiteboardApi.room.joinRoomApi(uuid);

        if (!roomToken) {
            throw new Error("Cannot fetch token for room: " + uuid);
        }

        const storageRoom = getRoom(uuid);
        // @TODO 支持多段视频
        const recording = storageRoom?.recordings?.[storageRoom.recordings.length - 1];

        const plugins = createPlugins({ video: videoPlugin, audio: audioPlugin });
        const contextIdentity = identity === Identity.creator ? "host" : "";
        plugins.setPluginContext("video", { identity: contextIdentity });
        plugins.setPluginContext("audio", { identity: contextIdentity });

        const whiteWebSdk = new WhiteWebSdk({
            appIdentifier: NETLESS.APP_IDENTIFIER,
            plugins: plugins,
        });

        this.whiteWebSdk = whiteWebSdk;

        const rangeQuery: PlayableCheckingParams = {
            room: uuid,
            region: "cn-hz",
        };

        if (recording) {
            rangeQuery.beginTimestamp = recording.startTime;
            rangeQuery.duration = recording.endTime - recording.startTime;
        }

        await polly()
            .waitAndRetry(10)
            .executeForPromise(
                async (): Promise<void> => {
                    const replayState = await whiteWebSdk.isPlayable(rangeQuery);
                    if (!replayState) {
                        return Promise.reject("Whiteboard is not playable");
                    }
                },
            );

        const cursorAdapter = new CursorTool();

        const replayRoomParams: ReplayRoomParams = {
            room: uuid,
            roomToken: roomToken,
            cursorAdapter: cursorAdapter,
        };

        if (recording) {
            replayRoomParams.beginTimestamp = recording.startTime;
            replayRoomParams.duration = recording.endTime - recording.startTime;
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
                        this.onPlay();
                        if (NODE_ENV === "development") {
                            console.log("SmartPlayer: start playing");
                        }
                        break;
                    }
                    case PlayerPhase.Pause: {
                        this._isPlaying = false;
                        this.onPause();
                        if (NODE_ENV === "development") {
                            console.log("SmartPlayer: paused");
                        }
                        break;
                    }
                    case PlayerPhase.Ended:
                    case PlayerPhase.Stopped: {
                        this._isPlaying = false;
                        this._isEnded = true;
                        this.onEnded();
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
                this.onError(error);
            },
        });

        cursorAdapter.setPlayer(player);

        player.bindHtmlElement(whiteboardEl);

        this.whiteboardPlayer = player;

        if (recording?.videoUrl) {
            const combinePlayerFactory = new CombinePlayerFactory(player, {
                url: recording.videoUrl,
                videoDOM: videoEl,
            });

            const combinePlayer = combinePlayerFactory.create();

            combinePlayer.setOnStatusChange(status => {
                switch (status) {
                    case PublicCombinedStatus.Playing: {
                        this._isPlaying = true;
                        this._isEnded = false;
                        this.onPlay();
                        if (NODE_ENV === "development") {
                            console.log("SmartPlayer: start playing");
                        }
                        break;
                    }
                    case PublicCombinedStatus.Pause: {
                        this._isPlaying = false;
                        this.onPause();
                        if (NODE_ENV === "development") {
                            console.log("SmartPlayer: paused");
                        }
                        break;
                    }
                    case PublicCombinedStatus.Ended: {
                        this._isPlaying = false;
                        this._isEnded = true;
                        this.onEnded();
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
        this.onReady();
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
            whiteboardPlayer.seekToScheduleTime(ms);
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

    public onReady(): void {}

    public onPlay(): void {}

    public onPause(): void {}

    public onEnded(): void {}

    public onError(error: Error): void {
        console.error("SmartPlayer: error", error);
    }

    private _isPlaying: boolean = false;

    private _isReady: boolean = false;

    private _isEnded: boolean = false;

    private checkWhiteboardLoaded(): Player {
        if (!this.whiteboardPlayer) {
            throw new Error("Whiteboard Player not loaded. Call `smartPlayer.load()` first.");
        }
        return this.whiteboardPlayer;
    }
}

export default SmartPlayer;

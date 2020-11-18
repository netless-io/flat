import { CursorTool } from "@netless/cursor-tool";
import polly from "polly-js";
import {
    WhiteWebSdk,
    PlayerPhase,
    Player,
    createPlugins,
    ReplayRoomParams,
    RangeQuery,
} from "white-web-sdk";
import CombinePlayerFactory, { CombinePlayer, PublicCombinedStatus } from "@netless/combine-player";
import { videoPlugin } from "@netless/white-video-plugin";
import { audioPlugin } from "@netless/white-audio-plugin";
import { Identity } from "../IndexPage";
import { netlessToken } from "../appToken";
import { netlessWhiteboardApi } from "./index";
import { LocalStorageRoomDataType } from "../HistoryPage";

/**
 * 智能播放画板与音视频，同时适应有无视频的情况
 */
export class SmartPlayer {
    public whiteboardPlayer: Player | undefined;
    public combinePlayer: CombinePlayer | undefined;
    public whiteWebSdk: WhiteWebSdk | undefined;

    public isPlaying = false;

    public constructor(config?: {
        onPlay?: () => void;
        onPause?: () => void;
        onEnded?: () => void;
        onError?: (error: Error) => void;
    }) {
        if (config) {
            if (config.onPlay) {
                this.onPlay = config.onPlay;
            }
            if (config.onPause) {
                this.onPause = config.onPause;
            }
            if (config.onEnded) {
                this.onEnded = config.onEnded;
            }
            if (config.onError) {
                this.onError = config.onError;
            }
        }
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
    }) {
        const roomToken = await netlessWhiteboardApi.room.joinRoomApi(uuid);

        if (!roomToken) {
            throw new Error("Cannot fetch token for room: " + uuid);
        }

        const storageRoom = this.getStorageRoom(uuid);
        // @TODO 支持多段视频
        const recording = storageRoom?.recordings?.[0];

        const plugins = createPlugins({ video: videoPlugin, audio: audioPlugin });
        plugins.setPluginContext("video", {
            identity: identity === Identity.creator ? "host" : "",
        });
        plugins.setPluginContext("audio", {
            identity: identity === Identity.creator ? "host" : "",
        });

        const whiteWebSdk = new WhiteWebSdk({
            appIdentifier: netlessToken.appIdentifier,
            plugins: plugins,
        });

        this.whiteWebSdk = whiteWebSdk;

        const rangeQuery: RangeQuery = {
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
                        this.isPlaying = true;
                        this.onPlay();
                        break;
                    }
                    case PlayerPhase.Pause: {
                        this.isPlaying = false;
                        this.onPause();
                        break;
                    }
                    case PlayerPhase.Ended:
                    case PlayerPhase.Stopped: {
                        this.isPlaying = false;
                        this.onEnded();
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
                        this.isPlaying = true;
                        this.onPlay();
                        break;
                    }
                    case PublicCombinedStatus.Pause: {
                        this.isPlaying = false;
                        this.onPause();
                        break;
                    }
                    case PublicCombinedStatus.Ended: {
                        this.isPlaying = false;
                        this.onEnded();
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });

            this.combinePlayer = combinePlayer;
        }

        if (process.env.NODE_ENV === "development") {
            // 供便捷调试
            (window as any).player = player;
            (window as any).combinePlayer = this.combinePlayer;
        }
    }

    public play(): void {
        if (this.isPlaying) {
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
        if (!this.isPlaying) {
            return;
        }
        const whiteboardPlayer = this.checkWhiteboardLoaded();
        if (this.combinePlayer) {
            this.combinePlayer.pause();
        } else {
            whiteboardPlayer.pause();
        }
    }

    public destroy(): void {
        this.whiteWebSdk = undefined;
        if (this.isPlaying) {
            this.whiteboardPlayer?.stop();
            this.combinePlayer?.pause();
        }
        // @ts-ignore TODO 等待 https://github.com/netless-io/netless-combine-player/pull/20
        this.combinePlayer?.removeAllStatusChange();
        this.whiteboardPlayer = undefined;
        this.combinePlayer = undefined;

        if (process.env.NODE_ENV === "development") {
            (window as any).player = null;
            (window as any).combinePlayer = null;
        }
    }

    public onPlay(): void {}

    public onPause(): void {}

    public onEnded(): void {}

    public onError(error: Error): void {
        console.error(error);
    }

    private checkWhiteboardLoaded(): Player {
        if (!this.whiteboardPlayer) {
            throw new Error("Whiteboard Player not loaded. Call `smartPlayer.load()` first.");
        }
        return this.whiteboardPlayer;
    }

    private getStorageRoom(uuid: string): LocalStorageRoomDataType | undefined {
        const rooms = localStorage.getItem("rooms");
        if (rooms) {
            const roomArray: LocalStorageRoomDataType[] = JSON.parse(rooms);
            return roomArray.find(data => data.uuid === uuid);
        }
        return;
    }
}

export default SmartPlayer;

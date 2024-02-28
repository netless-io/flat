import { FastboardPlayer, replayFastboard, Storage } from "@netless/fastboard";
import { Region, RoomType } from "@netless/flat-server-api";
import { AtomPlayer, NativeVideoPlayer, SyncPlayer, WhiteboardPlayer } from "@netless/sync-player";
import { action, makeAutoObservable, observable, runInAction } from "mobx";
import { SideEffectManager } from "side-effect-manager";

import { OnStageUsersStorageState } from "../classroom-store";
import { ClassroomReplayEventData } from "../classroom-store/event";
import { WHITEBOARD_RATIO } from "../constants";
import { globalStore } from "../global-store";
import { RoomItem, RoomRecording, roomStore } from "../room-store";
import { getRoomRecordings, makeVideoPlayer } from "./utils";
import { clamp } from "lodash-es";

export interface ClassroomReplayStoreConfig {
    roomUUID: string;
    ownerUUID: string;
    roomType: RoomType;
}

export class ClassroomReplayStore {
    public readonly sideEffect = new SideEffectManager();

    public readonly roomUUID: string;
    public readonly ownerUUID: string;
    public readonly roomType: RoomType;

    public readonly recordings = observable.array<RoomRecording>();

    public currentRecording: RoomRecording | null = null;

    public video: HTMLVideoElement | null = null;
    public fastboard: FastboardPlayer<ClassroomReplayEventData> | null = null;
    public syncPlayer: AtomPlayer | null = null;
    public onStageUsersStorage: Storage<OnStageUsersStorageState> | null = null;
    public onStageUsers = observable.array<string>([]);

    public isPlaying = false;
    public isBuffering = false;
    public tempTimestamp = 0; // used for displaying instant timestamp before debounced seeking

    public currentTime = 0; // mirror syncPlayer.currentTime
    public duration = 0; // mirror r.endTime - r.beginTime

    public get currentTimestamp(): number {
        return this.tempTimestamp || this.realTimestamp;
    }

    public get realTimestamp(): number {
        return (this.currentRecording?.beginTime || 0) + this.currentTime;
    }

    private _isLoadingRecording: { current: boolean; next: RoomRecording | null } = {
        current: false,
        next: null,
    };

    public constructor(config: ClassroomReplayStoreConfig) {
        (window as any).classroomReplayStore = this;

        this.roomUUID = config.roomUUID;
        this.ownerUUID = config.ownerUUID;
        this.roomType = config.roomType;

        makeAutoObservable<this, "_isLoadingRecording">(this, {
            sideEffect: false,
            fastboard: observable.ref,
            syncPlayer: observable.ref,
            currentRecording: observable.ref,
            _isLoadingRecording: false,
        });
    }

    public get roomInfo(): RoomItem | undefined {
        return roomStore.rooms.get(this.roomUUID);
    }

    public async init(): Promise<void> {
        this.updateRecordings(await getRoomRecordings(this.roomUUID));
    }

    public async destroy(): Promise<void> {
        this.syncPlayer?.pause();
        this.sideEffect.flushAll();
        this.fastboard?.destroy();

        (window as any).classroomReplayStore = undefined;
    }

    public updateRecordings(recordings: RoomRecording[]): void {
        this.recordings.replace(recordings);
    }

    public async loadRecording(recording: RoomRecording): Promise<void> {
        const config = globalStore.serverRegionConfig;
        if (!config || !config.whiteboard.appId) {
            throw new Error("missing server region config");
        }

        if (!globalStore.whiteboardRoomUUID || !globalStore.whiteboardRoomToken) {
            throw new Error("Missing whiteboard UUID and Token");
        }

        if (recording === this.currentRecording) {
            return;
        }

        if (this._isLoadingRecording.current) {
            this._isLoadingRecording.next = recording;
            return;
        }

        this._isLoadingRecording = { current: true, next: null };
        this.currentRecording = recording;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = recording.endTime - recording.beginTime;
        this.video = null;

        if (this.fastboard) {
            await this.fastboard.destroy();
        }

        const fastboard = await replayFastboard<ClassroomReplayEventData>({
            sdkConfig: {
                appIdentifier: config.whiteboard.appId,
                region:
                    globalStore.region ??
                    (globalStore.serverRegionConfig?.whiteboard.convertRegion as Region),
                pptParams: {
                    useServerWrap: true,
                },
            },
            replayRoom: {
                room: globalStore.whiteboardRoomUUID,
                roomToken: globalStore.whiteboardRoomToken,
                beginTimestamp: recording.beginTime,
                duration: recording.endTime - recording.beginTime,
            },
            managerConfig: {
                cursor: true,
                containerSizeRatio: WHITEBOARD_RATIO,
                viewMode: "scroll",
            },
        });

        const onStageUsersStorage = fastboard.syncedStore.connectStorage<OnStageUsersStorageState>(
            "onStageUsers",
            {},
        );
        this.sideEffect.push(
            onStageUsersStorage.on("stateChanged", () => {
                this.updateOnStageUsers(onStageUsersStorage.state);
            }),
            "onStageUsers",
        );

        const next = this._isLoadingRecording.next;
        if (next) {
            this._isLoadingRecording = { current: false, next: null };
            await fastboard.destroy();
            return this.loadRecording(next);
        }

        this._isLoadingRecording = { current: false, next: null };

        this.sideEffect.push(
            fastboard.phase.subscribe(phase => {
                runInAction(() => {
                    this.isBuffering = phase === "buffering";
                    if (phase === "ended") {
                        this.pause();
                    }
                });
            }),
            "isBuffering",
        );

        this.updateFastboard(fastboard, onStageUsersStorage);

        const players: AtomPlayer[] = [];

        const whiteboardPlayer = new WhiteboardPlayer({
            name: "whiteboard",
            player: fastboard.player,
        });
        players.push(whiteboardPlayer);

        if (recording.videoURL) {
            const video = makeVideoPlayer(recording.videoURL);
            const videoPlayer = new NativeVideoPlayer({ name: "main", video });
            players.push(videoPlayer);
            this.updateVideo(video);
        } else {
            this.updateVideo(null);
        }

        const syncPlayer = new SyncPlayer({ players });
        this.sideEffect.add(() => {
            const updateCurrentTime = action(() => {
                this.currentTime = Math.min(syncPlayer.currentTime, this.duration);
            });
            syncPlayer.on("timeupdate", updateCurrentTime);
            return () => {
                syncPlayer.off("timeupdate", updateCurrentTime);
            };
        }, "syncCurrentTime");

        this.updateSyncPlayer(syncPlayer);
    }

    public updateVideo(video: HTMLVideoElement | null): void {
        this.video = video;
    }

    public updateSyncPlayer(player: AtomPlayer | null): void {
        this.syncPlayer?.pause();
        this.syncPlayer = player;
    }

    public updateFastboard(
        fastboard: FastboardPlayer,
        onStageUsersStorage: Storage<OnStageUsersStorageState>,
    ): void {
        this.fastboard = fastboard;
        this.onStageUsersStorage = onStageUsersStorage;
    }

    public updateOnStageUsers(state: Record<string, boolean>): void {
        this.onStageUsers.replace(Object.keys(state).filter(userUUID => state[userUUID]));
    }

    public play(): void {
        this.syncPlayer?.play();
        this.isPlaying = true;
    }

    public pause(): void {
        this.isPlaying = false;
        this.syncPlayer?.pause();
    }

    public seek = (timestamp: number): void => {
        this.tempTimestamp = timestamp;
        this.sideEffect.setTimeout(this.seekNow, 100, "seek");
    };

    public fastForward(ms: number): void {
        if (this.currentRecording) {
            const { beginTime, endTime } = this.currentRecording;
            this.seek(clamp(this.currentTimestamp + ms, beginTime, endTime - 100));
        }
    }

    private seekNow = (): void => {
        if (this.currentRecording && this.syncPlayer) {
            this.syncPlayer.seek(this.tempTimestamp - this.currentRecording.beginTime);
            this.tempTimestamp = 0;
        }
    };

    public togglePlayPause = (): void => {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    };
}

import { AnimationMode, FastboardPlayer, replayFastboard, Storage } from "@netless/fastboard";
import { RoomType } from "@netless/flat-server-api";
import { SyncPlayer, AtomPlayer, NativeVideoPlayer, WhiteboardPlayer } from "@netless/sync-player";
import { addYears } from "date-fns";
import { ChatMsg } from "flat-components";
import { action, makeAutoObservable, observable, runInAction } from "mobx";
import { SideEffectManager } from "side-effect-manager";

import { DeviceStateStorageState, OnStageUsersStorageState } from "../classroom-store";
import { ClassroomReplayEventData } from "../classroom-store/event";
import { globalStore } from "../global-store";
import { RoomItem, RoomRecording, roomStore } from "../room-store";
import { UserStore } from "../user-store";
import { TextChatHistory } from "./history";
import { getRecordings, makeVideoPlayer, Recording } from "./utils";

export interface ClassroomReplayStoreConfig {
    roomUUID: string;
    ownerUUID: string;
    roomType: RoomType;
}

export class ClassroomReplayStore {
    public readonly sideEffect = new SideEffectManager();

    public readonly roomUUID: string;
    public readonly ownerUUID: string;
    public readonly userUUID: string;
    public readonly roomType: RoomType;

    public readonly history: TextChatHistory;

    public readonly users: UserStore;
    public readonly onStageUserUUIDs = observable.array<string>();
    public readonly recordings = observable.array<Recording>();
    public readonly userVideos = observable.map<string, HTMLVideoElement>();
    public readonly userDevices = observable.map<string, DeviceStateStorageState[string]>();

    public syncPlayer: AtomPlayer | null = null;

    /** RTM messages */
    public messages = observable.array<ChatMsg>();

    public fastboard: FastboardPlayer<ClassroomReplayEventData> | null = null;

    public onStageUsersStorage: Storage<OnStageUsersStorageState> | null = null;

    public currentRecording: RoomRecording | null = null;

    public isPlaying = false;
    public isBuffering = false;
    public tempTimestamp = 0;
    public realTimestamp = 0;

    public currentTime = 0;
    public duration = 0;

    public get currentTimestamp(): number {
        return this.tempTimestamp || this.realTimestamp;
    }

    private cachedMessages = observable.array<ChatMsg>();
    private _isLoadingRecording: { current: boolean; next: RoomRecording | null } = {
        current: false,
        next: null,
    };
    private _oldestSeekTime = -1;
    private _isLoadingHistory = false;
    private _remoteNewestTimestamp = Infinity;

    public constructor(config: ClassroomReplayStoreConfig) {
        if (!globalStore.userUUID) {
            throw new Error("Missing userUUID");
        }

        (window as any).classroomReplayStore = this;

        this.roomUUID = config.roomUUID;
        this.ownerUUID = config.ownerUUID;
        this.userUUID = globalStore.userUUID;
        this.roomType = config.roomType;
        this.history = new TextChatHistory(this);

        this.users = new UserStore({
            roomUUID: config.roomUUID,
            ownerUUID: config.ownerUUID,
            userUUID: this.userUUID,
            isInRoom: () => false,
        });

        makeAutoObservable<
            this,
            | "_isLoadingHistory"
            | "_oldestSeekTime"
            | "_remoteNewestTimestamp"
            | "_isLoadingRecording"
        >(this, {
            sideEffect: false,
            history: false,
            fastboard: observable.ref,
            syncPlayer: observable.ref,
            currentRecording: observable.ref,
            onStageUsersStorage: false,
            _isLoadingHistory: false,
            _oldestSeekTime: false,
            _remoteNewestTimestamp: false,
            _isLoadingRecording: false,
        });
    }

    public get roomInfo(): RoomItem | undefined {
        return roomStore.rooms.get(this.roomUUID);
    }

    public get isCreator(): boolean {
        return this.ownerUUID === this.userUUID;
    }

    public async init(): Promise<void> {
        this.updateRecordings(await getRecordings(this.roomUUID));
    }

    public async destroy(): Promise<void> {
        this.syncPlayer?.pause();
        this.sideEffect.flushAll();
        this.fastboard?.destroy();
    }

    public updateRecordings(recordings: Recording[]): void {
        this.recordings.replace(recordings);
    }

    public async loadRecording(recording: Recording): Promise<void> {
        if (!process.env.NETLESS_APP_IDENTIFIER) {
            throw new Error("Missing NETLESS_APP_IDENTIFIER");
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

        if (this.fastboard) {
            await this.fastboard.destroy();
        }

        const fastboard = await replayFastboard<ClassroomReplayEventData>({
            sdkConfig: {
                appIdentifier: process.env.NETLESS_APP_IDENTIFIER,
                region: globalStore.region ?? "cn-hz",
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
            },
        });

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

        const onStageUsersStorage = fastboard.syncedStore.connectStorage<OnStageUsersStorageState>(
            "onStageUsers",
            {},
        );
        const refreshOnStageUserUUIDs = (): void => {
            runInAction(() => {
                const onStageUserUUIDs = [];
                for (const key in onStageUsersStorage.state) {
                    if (onStageUsersStorage.state[key]) {
                        onStageUserUUIDs.push(key);
                    }
                }
                this.onStageUserUUIDs.replace(onStageUserUUIDs);
            });
        };
        this.sideEffect.push(
            onStageUsersStorage.on("stateChanged", refreshOnStageUserUUIDs),
            "onStageUsers",
        );
        refreshOnStageUserUUIDs();

        this.users.initUsers([this.ownerUUID]);
        this.updateFastboard(fastboard, onStageUsersStorage);

        const scrollTopStorage = fastboard.syncedStore.connectStorage<{ scrollTop: number }>(
            "scroll",
            { scrollTop: 0 },
        );
        this.sideEffect.push(
            scrollTopStorage.on("stateChanged", () => {
                const scrollTop = scrollTopStorage.state.scrollTop;
                const BASE_WIDTH = 1600;
                const { height, scale } = fastboard.manager.cameraState;
                fastboard.manager.mainView.moveCameraToContain({
                    originX: 0,
                    originY: scrollTop - height / scale / 2,
                    width: BASE_WIDTH,
                    height: height / scale,
                    animationMode: "immediately" as AnimationMode,
                });
            }),
            "scrollTop",
        );

        const deviceStateStorage = fastboard.syncedStore.connectStorage<DeviceStateStorageState>(
            "deviceState",
            {},
        );
        this.sideEffect.push(
            deviceStateStorage.on("stateChanged", () => {
                this.userDevices.replace(deviceStateStorage.state);
            }),
            "deviceState",
        );

        const players: AtomPlayer[] = [];
        players.push(new WhiteboardPlayer({ name: "whiteboard", player: fastboard.player }));
        const userVideos = new Map<string, HTMLVideoElement>();
        if (recording.videoURL) {
            const mainVideo = makeVideoPlayer(recording.videoURL);
            userVideos.set(this.userUUID, mainVideo);
            players.push(new NativeVideoPlayer({ name: "main", video: mainVideo }));
        }
        if (recording.users) {
            for (const userUUID in recording.users) {
                const { videoURL } = recording.users[userUUID];
                const userVideo = makeVideoPlayer(videoURL);
                userVideos.set(userUUID, userVideo);
                const userPlayer = new NativeVideoPlayer({ name: userUUID, video: userVideo });
                players.push(userPlayer);
            }
        }
        const syncPlayer = new SyncPlayer({ players });
        this.sideEffect.add(() => {
            const updateDuration = action(() => {
                this.duration = syncPlayer.duration;
            });
            syncPlayer.on("durationchange", updateDuration);
            const updateCurrentTime = action(() => {
                this.currentTime = syncPlayer.currentTime;
            });
            syncPlayer.on("timeupdate", updateCurrentTime);
            return () => {
                syncPlayer.off("durationchange", updateDuration);
                syncPlayer.off("timeupdate", updateCurrentTime);
            };
        }, "syncCurrentTime");
        this.sideEffect.add(() => {
            syncPlayer.on("timeupdate", this.syncMessages);
            return () => {
                syncPlayer.off("timeupdate", this.syncMessages);
            };
        }, "syncMessages");
        this.updateUserVideos(userVideos, syncPlayer);
    }

    public updateUserVideos(userVideos: Map<string, HTMLVideoElement>, player: AtomPlayer): void {
        this.userVideos.replace(userVideos);
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

    public onNewMessage(msg: ChatMsg): void {
        this.messages.push(msg);
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

    private seekNow = (): void => {
        if (this.currentRecording && this.syncPlayer) {
            this.syncPlayer.seek(this.tempTimestamp - this.currentRecording.beginTime);
        }
    };

    public togglePlayPause = (): void => {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    };

    private syncMessages = async (): Promise<void> => {
        if (!this.syncPlayer || !this.currentRecording) {
            return;
        }

        if (this._isLoadingHistory) {
            return;
        }

        const currentTimestamp = this.currentRecording.beginTime + this.syncPlayer.currentTime;
        this.realTimestamp = currentTimestamp;
        if (this.tempTimestamp === this.realTimestamp) {
            this.tempTimestamp = 0;
        }
        if (this.cachedMessages.length === 0) {
            const newMessages = await this.getHistory(currentTimestamp - 1);
            if (newMessages.length === 0) {
                return;
            }
            this._oldestSeekTime = currentTimestamp;
            runInAction(() => {
                this.cachedMessages.replace(newMessages);
            });
            return this.syncMessages();
        }

        if (currentTimestamp < this._oldestSeekTime) {
            runInAction(() => {
                this.messages.clear();
                this.cachedMessages.clear();
            });
            return this.syncMessages();
        }

        if (
            this.messages.length > 0 &&
            currentTimestamp < this.messages[this.messages.length - 1].timestamp
        ) {
            runInAction(() => {
                this.messages.clear();
            });
            return this.syncMessages();
        }

        let start = this.messages.length;
        while (
            start < this.cachedMessages.length &&
            currentTimestamp >= this.cachedMessages[start].timestamp
        ) {
            start++;
        }

        if (start === this.messages.length) {
            // no new messages
            return;
        }

        if (start >= this.cachedMessages.length) {
            // more messages need to be loaded
            const newMessages = await this.getHistory(
                this.cachedMessages[this.cachedMessages.length - 1].timestamp,
            );
            if (newMessages.length > 0) {
                runInAction(() => {
                    this.cachedMessages.push(...newMessages);
                });
                return this.syncMessages();
            }
        }

        runInAction(() => {
            this.messages.push(...this.cachedMessages.slice(this.messages.length, start));
        });
    };

    private getHistory = async (newestTimestamp: number): Promise<ChatMsg[]> => {
        let history: ChatMsg[] = [];

        if (newestTimestamp >= this._remoteNewestTimestamp) {
            return history;
        }

        this._isLoadingHistory = true;

        try {
            const messages = await this.history.fetchTextHistory(
                newestTimestamp + 1,
                addYears(newestTimestamp, 1).valueOf(),
            );

            if (messages.length === 0) {
                this._remoteNewestTimestamp = newestTimestamp;
            }

            history = messages.map(msg => ({
                type: "room-message",
                ...msg,
            }));

            // fetch user name first to avoid flashing
            await this.users
                .syncExtraUsersInfo(history.map(msg => msg.senderID))
                .catch(console.warn); // swallow error
        } catch (error) {
            console.warn(error);
        }

        this._isLoadingHistory = false;

        return history;
    };
}

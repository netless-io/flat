import { useState } from "react";
import { makeAutoObservable, observable, runInAction } from "mobx";
import dateAdd from "date-fns/add";
import { Rtm as RTMAPI, RTMessageType } from "../api-middleware/Rtm";
import { SmartPlayer, SmartPlayerEventType } from "../api-middleware/SmartPlayer";
import { globalStore } from "./GlobalStore";
import { RoomItem, roomStore } from "./room-store";
import { NODE_ENV } from "../constants/process";
import { useAutoRun } from "../utils/mobx";
import { RoomType } from "../api-middleware/flatServer/constants";
import { UserStore } from "./user-store";
import { RTMChannelMessage } from "./class-room-store";

export class ClassRoomReplayStore {
    public readonly roomUUID: string;

    public readonly userUUID: string;

    public readonly rtm = new RTMAPI();

    public readonly smartPlayer = new SmartPlayer();

    public readonly users: UserStore;

    /** RTM messages */
    public messages = observable.array<RTMChannelMessage>([]);

    public withRTCVideo = false;

    public isReady = false;

    public isPlaying = false;

    public error?: Error;

    /** All of the fetched messages */
    private cachedMessages = observable.array<RTMChannelMessage>([]);

    /** This ownerUUID is from url params matching which cannot be trusted */
    private readonly ownerUUIDFromParams: string;

    private readonly roomTypeFromParams: RoomType;

    /** Player unix time */
    private _currentPlayTime = -1;

    /** The timestamp when seeking the first chunk of the current messages */
    private _oldestSeekTime = -1;

    private _isLoadingHistory = false;

    /** The timestamp of the newest message on remote */
    private _remoteNewestTimestamp = Infinity;

    public constructor(config: { roomUUID: string; ownerUUID: string; roomType: RoomType }) {
        if (!globalStore.userUUID) {
            throw new Error("Missing userUUID");
        }

        this.roomUUID = config.roomUUID;
        this.ownerUUIDFromParams = config.ownerUUID;
        this.roomTypeFromParams = config.roomType;
        this.userUUID = globalStore.userUUID;

        this.users = new UserStore({
            roomUUID: this.roomUUID,
            ownerUUID: this.ownerUUID,
            userUUID: this.userUUID,
        });

        makeAutoObservable<
            this,
            "_remoteNewestTimestamp" | "_isLoadingHistory" | "_currentPlayTime" | "_oldestSeekTime"
        >(this, {
            rtm: observable.ref,
            smartPlayer: observable.ref,
            _remoteNewestTimestamp: false,
            _isLoadingHistory: false,
            _currentPlayTime: false,
            _oldestSeekTime: false,
        });

        this.smartPlayer.on(SmartPlayerEventType.Ready, () => {
            this.updateReadyState(true);
            this.updatePlayingState();
        });
        this.smartPlayer.on(SmartPlayerEventType.Play, this.updatePlayingState);
        this.smartPlayer.on(SmartPlayerEventType.Pause, this.updatePlayingState);
        this.smartPlayer.on(SmartPlayerEventType.Ended, this.updatePlayingState);
        this.smartPlayer.on(SmartPlayerEventType.Error, this.updateError);
    }

    public get ownerUUID(): string {
        if (this.roomInfo) {
            if (NODE_ENV === "development") {
                if (this.roomInfo.ownerUUID !== this.ownerUUIDFromParams) {
                    throw new Error("ClassRoom Error: ownerUUID mismatch!");
                }
            }
            return this.roomInfo.ownerUUID;
        }
        return this.ownerUUIDFromParams;
    }

    public get roomInfo(): RoomItem | undefined {
        return roomStore.rooms.get(this.roomUUID);
    }

    public get isCreator(): boolean {
        return this.ownerUUID === this.userUUID;
    }

    public get roomType(): RoomType {
        if (this.roomInfo?.roomType) {
            if (NODE_ENV === "development") {
                if (this.roomInfo.roomType !== this.roomTypeFromParams) {
                    throw new Error("ClassRoom Error: roomType mismatch!");
                }
            }
            return this.roomInfo.roomType;
        }
        return this.roomTypeFromParams;
    }

    public init = async (
        whiteboardEl: HTMLDivElement,
        videoEl: HTMLVideoElement,
    ): Promise<void> => {
        await roomStore.syncRecordInfo(this.roomUUID);

        if (!globalStore.whiteboardRoomUUID || !globalStore.whiteboardRoomToken) {
            throw new Error("Missing Whiteboard UUID and Token");
        }

        try {
            await this.smartPlayer.load({
                roomUUID: this.roomUUID,
                isCreator: this.isCreator,
                whiteboardUUID: globalStore.whiteboardRoomUUID,
                whiteboardRoomToken: globalStore.whiteboardRoomToken,
                region: globalStore.region ?? undefined,
                whiteboardEl,
                videoEl,
                recording:
                    (this.roomInfo?.recordings?.length as number) > 0
                        ? this.roomInfo?.recordings?.[0]
                        : void 0,
            });
        } catch (error) {
            console.error(error);
            this.updateError(error as Error);
        }

        runInAction(() => {
            this.isReady = this.smartPlayer.isReady;
            this.isPlaying = this.smartPlayer.isPlaying;
            this.withRTCVideo = Boolean(this.smartPlayer.combinePlayer);
        });

        this.smartPlayer.whiteboardPlayer?.callbacks.on(
            "onProgressTimeChanged",
            this.onPlayerProgressTimeChanged,
        );

        await this.rtm.init(this.userUUID, this.roomUUID);
    };

    public destroy = (): void => {
        this.smartPlayer.destroy();
        this.smartPlayer.removeAllListeners();
        void this.rtm.destroy();
        this.smartPlayer.whiteboardPlayer?.callbacks.off(
            "onProgressTimeChanged",
            this.onPlayerProgressTimeChanged,
        );
    };

    public togglePlayPause = (): void => {
        if (!this.smartPlayer.isReady) {
            return;
        }
        if (this.smartPlayer.isPlaying) {
            this.smartPlayer.pause();
        } else {
            if (this.smartPlayer.isEnded) {
                this.smartPlayer.seek(0);
            }
            this.smartPlayer.play();
        }
    };

    /** Sync messages according to replay player time */
    private syncMessages = async (): Promise<void> => {
        if (this._isLoadingHistory) {
            return;
        }

        if (this.cachedMessages.length <= 0) {
            // cache the timestamp from this
            const newestTimestamp = this._currentPlayTime;
            const newMessages = await this.getHistory(newestTimestamp - 1);
            if (newMessages.length <= 0) {
                return;
            }
            this._oldestSeekTime = newestTimestamp;
            runInAction(() => {
                this.cachedMessages.replace(newMessages);
            });
            return this.syncMessages();
        }

        if (this._currentPlayTime < this._oldestSeekTime) {
            // user seeked backward
            // start over
            runInAction(() => {
                this.messages.clear();
                this.cachedMessages.clear();
            });
            return this.syncMessages();
        }

        if (
            this.messages.length > 0 &&
            this._currentPlayTime < this.messages[this.messages.length - 1].timestamp
        ) {
            // user seeked backward but still within total loaded messages range.
            // reset rendered messages
            runInAction(() => {
                this.messages.clear();
            });
            return this.syncMessages();
        }

        let start = this.messages.length;
        while (
            start < this.cachedMessages.length &&
            this._currentPlayTime >= this.cachedMessages[start].timestamp
        ) {
            start += 1;
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

    private getHistory = async (newestTimestamp: number): Promise<RTMChannelMessage[]> => {
        let histories: RTMChannelMessage[] = [];

        if (newestTimestamp >= this._remoteNewestTimestamp) {
            return histories;
        }

        this._isLoadingHistory = true;

        try {
            const messages = await this.rtm.fetchTextHistory(
                newestTimestamp + 1,
                dateAdd(newestTimestamp, { years: 1 }).valueOf(),
            );

            if (messages.length <= 0) {
                this._remoteNewestTimestamp = newestTimestamp;
            }

            histories = messages.filter(
                (message): message is RTMChannelMessage =>
                    message.type === RTMessageType.ChannelMessage,
            );

            // fetch user name first to avoid flashing
            await this.users
                .syncExtraUsersInfo(histories.map(msg => msg.userUUID))
                .catch(console.warn); // swallow error
        } catch (e) {
            console.warn(e);
        }

        this._isLoadingHistory = false;

        return histories;
    };

    private onPlayerProgressTimeChanged = (offset: number): void => {
        // always keep the latest current time
        this._currentPlayTime = this.smartPlayer.whiteboardPlayer!.beginTimestamp + offset;
        void this.syncMessages();
    };

    private updateReadyState = (ready: boolean): void => {
        this.isReady = ready;
    };

    private updatePlayingState = (): void => {
        this.isPlaying = this.smartPlayer.isPlaying;
    };

    private updateError = (error: Error): void => {
        this.error = error;
    };
}

export function useClassRoomReplayStore(
    roomUUID: string,
    ownerUUID: string,
    roomType: RoomType,
): ClassRoomReplayStore {
    const [classRoomReplayStore] = useState(
        () => new ClassRoomReplayStore({ roomUUID, ownerUUID, roomType }),
    );

    useAutoRun(() => {
        const title = classRoomReplayStore.roomInfo?.title;
        if (title) {
            document.title = title;
        }
    });

    return classRoomReplayStore;
}

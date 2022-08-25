import { makeAutoObservable, observable } from "mobx";
import { ChatMsg } from "flat-components";
import { replayFastboard, FastboardPlayer } from "@netless/fastboard";
import { DeviceType } from "white-web-sdk";
import { SideEffectManager } from "side-effect-manager";

import type { ClassroomReplayEventData } from "../classroom-store/event";
import { globalStore } from "../global-store";
import { RoomItem, RoomRecording, roomStore } from "../room-store";
import { ClassModeType } from "../classroom-store";
import { UserStore } from "../user-store";

export interface ClassroomReplayStoreConfig {
    roomUUID: string;
    ownerUUID: string;
}

export class ClassroomReplayStore {
    private sideEffect = new SideEffectManager();

    public readonly roomUUID: string;
    public readonly ownerUUID: string;
    public readonly userUUID: string;
    /** room class mode */
    public classMode: ClassModeType;

    public readonly users: UserStore;

    /** RTM messages */
    public messages = observable.array<ChatMsg>([]);

    public withRTCVideo = false;

    public isReady = false;

    public isPlaying = false;

    public error: Error | null = null;

    public fastboard: FastboardPlayer<ClassroomReplayEventData> | null = null;

    private currentRecording: RoomRecording | null = null;

    public constructor(config: ClassroomReplayStoreConfig) {
        if (!globalStore.userUUID) {
            throw new Error("Missing userUUID");
        }

        this.roomUUID = config.roomUUID;
        this.ownerUUID = config.ownerUUID;
        this.classMode = ClassModeType.Lecture;
        this.userUUID = globalStore.userUUID;

        this.users = new UserStore({
            roomUUID: this.roomUUID,
            ownerUUID: this.ownerUUID,
            userUUID: this.userUUID,
            isInRoom: () => false,
        });

        makeAutoObservable<this, "sideEffect" | "_currentPlayTime" | "_oldestSeekTime">(this, {
            sideEffect: false,
            _currentPlayTime: false,
            _oldestSeekTime: false,
        });
    }

    public get roomInfo(): RoomItem | undefined {
        return roomStore.rooms.get(this.roomUUID);
    }

    public get isCreator(): boolean {
        return this.ownerUUID === this.userUUID;
    }

    public init = async (): Promise<void> => {
        await roomStore.syncRecordInfo(this.roomUUID);
        if (process.env.Node_ENV === "development") {
            if (this.roomInfo && this.roomInfo.ownerUUID !== this.ownerUUID) {
                (this.ownerUUID as string) = this.roomInfo.ownerUUID;
                if (process.env.DEV) {
                    console.error(new Error("ClassRoom Error: ownerUUID mismatch!"));
                }
            }
        }

        const recordings = this.roomInfo?.recordings;

        if (!recordings || recordings.length <= 0) {
            throw new Error("No recording");
        }
    };

    public destroy = (): void => {
        this.sideEffect.flushAll();
    };

    public async loadRecording(recording: RoomRecording): Promise<void> {
        if (recording === this.currentRecording) {
            return;
        }

        this.currentRecording = recording;

        const NETLESS_APP_IDENTIFIER = process.env.NETLESS_APP_IDENTIFIER;
        if (!NETLESS_APP_IDENTIFIER) {
            throw new Error("Missing env NETLESS_APP_IDENTIFIER");
        }

        if (!globalStore.whiteboardRoomUUID || !globalStore.whiteboardRoomToken) {
            throw new Error("Missing Whiteboard UUID and Token");
        }

        if (!globalStore.userUUID) {
            throw new Error("Missing userUUID");
        }

        const fastboard = await replayFastboard<ClassroomReplayEventData>({
            sdkConfig: {
                appIdentifier: NETLESS_APP_IDENTIFIER,
                deviceType: DeviceType.Surface,
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
        this.fastboard = fastboard;

        this.sideEffect.addDisposer(
            fastboard.syncedStore.addEventListener("new-message", event => {
                this.messages.push(event.payload);
            }),
        );

        // @TODO load synced Player
    }

    public togglePlayPause = (): void => {
        // @TODO
    };
}

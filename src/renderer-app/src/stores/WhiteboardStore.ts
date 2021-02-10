import { useEffect, useState } from "react";
import { makeAutoObservable, observable, reaction } from "mobx";
import { createPlugins, Room, RoomPhase, RoomState, ViewMode, WhiteWebSdk } from "white-web-sdk";
import { videoPlugin } from "@netless/white-video-plugin";
import { audioPlugin } from "@netless/white-audio-plugin";
import { CursorTool } from "@netless/cursor-tool";
import { NETLESS, NODE_ENV } from "../constants/Process";
import { globalStore } from "./GlobalStore";
import { RouteNameType, usePushHistory } from "../utils/routes";
import { useSafePromise } from "../utils/hooks/lifecycle";

export class WhiteboardStore {
    room: Room | null = null;
    phase: RoomPhase = RoomPhase.Connecting;
    viewMode: ViewMode | null = null;
    isWritable: boolean;
    isShowPreviewPanel: boolean = false;
    isFileOpen: boolean = false;

    /** is room Creator */
    private readonly isCreator: boolean;

    constructor(config: { isCreator: boolean }) {
        this.isCreator = config.isCreator;
        this.isWritable = config.isCreator;
        makeAutoObservable(this, {
            room: observable.ref,
        });

        reaction(
            () => this.isWritable,
            async isWritable => {
                if (this.room) {
                    await this.room.setWritable(isWritable);
                    this.room.disableDeviceInputs = !isWritable;
                    this.room.disableSerialization = !isWritable;
                }
            },
        );
    }

    updateRoom = (room: Room): void => {
        this.room = room;
    };

    updatePhase = (phase: RoomPhase): void => {
        this.phase = phase;
    };

    updateViewMode = (viewMode: ViewMode): void => {
        this.viewMode = viewMode;
    };

    updateWritable = (isWritable: boolean): void => {
        this.isWritable = isWritable;
    };

    setFileOpen = (open: boolean): void => {
        this.isFileOpen = open;
    };

    toggleFileOpen = (): void => {
        this.isFileOpen = !this.isFileOpen;
    };

    showPreviewPanel = (): void => {
        this.isShowPreviewPanel = true;
    };

    setPreviewPanel = (show: boolean): void => {
        this.isShowPreviewPanel = show;
    };

    async joinWhiteboardRoom(): Promise<void> {
        if (!globalStore.userUUID) {
            throw new Error("Missing userUUID");
        }

        if (!globalStore.whiteboardRoomUUID || !globalStore.whiteboardRoomToken) {
            throw new Error("Missing Whiteboard UUID and Token");
        }

        const plugins = createPlugins({ video: videoPlugin, audio: audioPlugin });
        const contextIdentity = this.isCreator ? "host" : "";
        plugins.setPluginContext("video", { identity: contextIdentity });
        plugins.setPluginContext("audio", { identity: contextIdentity });
        const whiteWebSdk = new WhiteWebSdk({
            appIdentifier: NETLESS.APP_IDENTIFIER,
            plugins: plugins,
        });
        const cursorName = globalStore.wechat?.name;
        const cursorAdapter = new CursorTool();
        const room = await whiteWebSdk.joinRoom(
            {
                uuid: globalStore.whiteboardRoomUUID,
                roomToken: globalStore.whiteboardRoomToken,
                cursorAdapter: cursorAdapter,
                userPayload: { userId: globalStore.userUUID, cursorName },
                floatBar: true,
                isWritable: this.isWritable,
            },
            {
                onPhaseChanged: phase => {
                    this.updatePhase(phase);
                },
                onRoomStateChanged: (modifyState: Partial<RoomState>): void => {
                    if (modifyState.broadcastState) {
                        this.updateViewMode(modifyState.broadcastState.mode);
                    }
                },
                onDisconnectWithError: error => {
                    console.error(error);
                },
            },
        );

        room.disableDeviceInputs = !this.isWritable;

        cursorAdapter.setRoom(room);

        if (this.isCreator) {
            room.setMemberState({
                pencilOptions: {
                    disableBezier: false,
                    sparseHump: 1.0,
                    sparseWidth: 1.0,
                    enableDrawPoint: false,
                },
            });
        }

        if (room.state.broadcastState) {
            this.updateViewMode(room.state.broadcastState.mode);
        }

        this.updateRoom(room);

        if (NODE_ENV === "development") {
            (window as any).room = room;
        }
    }

    destroy(): void {
        if (this.room) {
            this.room.callbacks.off();
        }
        if (NODE_ENV === "development") {
            (window as any).room = null;
        }
        console.log(`Whiteboard unloaded: ${globalStore.whiteboardRoomUUID}`);
    }
}

export function useWhiteboardStore(isCreator: boolean): WhiteboardStore {
    const [whiteboardStore] = useState(() => new WhiteboardStore({ isCreator }));
    const pushHistory = usePushHistory();
    const sp = useSafePromise();

    useEffect(() => {
        sp(whiteboardStore.joinWhiteboardRoom()).catch(e => {
            console.error(e);
            // @TODO
            // if (e.message.endsWith("is ban")) {
            //     show error("房间已关闭");
            // }
            pushHistory(RouteNameType.HomePage);
        });

        return () => {
            whiteboardStore.destroy();
        };
        // only join room once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return whiteboardStore;
}

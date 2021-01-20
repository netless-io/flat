import { useEffect, useState } from "react";
import { makeAutoObservable, observable } from "mobx";
import { createPlugins, Room, RoomPhase, RoomState, ViewMode, WhiteWebSdk } from "white-web-sdk";
import { v4 as uuidv4 } from "uuid";
import { videoPlugin } from "@netless/white-video-plugin";
import { audioPlugin } from "@netless/white-audio-plugin";
import { CursorTool } from "@netless/cursor-tool";
import { PPTDataType, PPTType } from "@netless/oss-upload-manager";

import { pptDatas } from "../taskUuids";
import { NETLESS, NODE_ENV } from "../constants/Process";
import { mergeConfig } from "./utils";
import { globalStore } from "./GlobalStore";

export class WhiteboardStore {
    userUUID: string = "";
    whiteboardUUID: string = "";
    whiteboardToken: string = "";
    room: Room | null = null;
    phase: RoomPhase = RoomPhase.Connecting;
    viewMode: ViewMode | null = null;
    isCreator: boolean = false;
    isShowPreviewPanel: boolean = false;
    isFileOpen: boolean = false;

    constructor(config: {
        userUUID: string;
        whiteboardUUID: string;
        whiteboardToken: string;
        isCreator: boolean;
    }) {
        mergeConfig(this, config);
        makeAutoObservable(this, {
            room: observable.ref,
        });
    }

    updateRoom(room: Room) {
        this.room = room;
    }

    updatePhase(phase: RoomPhase) {
        this.phase = phase;
    }

    updateViewMode(viewMode: ViewMode) {
        this.viewMode = viewMode;
    }

    toggleFileOpen(open?: boolean) {
        this.isFileOpen = open ?? !this.isFileOpen;
    }

    togglePreviewPanel(show?: boolean) {
        this.isShowPreviewPanel = show ?? !this.isShowPreviewPanel;
    }

    async joinWhiteboardRoom() {
        try {
            const plugins = createPlugins({ video: videoPlugin, audio: audioPlugin });
            const contextIdentity = this.isCreator ? "host" : "";
            plugins.setPluginContext("video", { identity: contextIdentity });
            plugins.setPluginContext("audio", { identity: contextIdentity });
            const whiteWebSdk = new WhiteWebSdk({
                appIdentifier: NETLESS.APP_IDENTIFIER,
                plugins: plugins,
            });
            const cursorName = localStorage.getItem("userName");
            const cursorAdapter = new CursorTool();
            const room = await whiteWebSdk.joinRoom(
                {
                    uuid: this.whiteboardUUID,
                    roomToken: this.whiteboardToken,
                    cursorAdapter: cursorAdapter,
                    userPayload: { userId: this.userUUID, cursorName },
                    floatBar: true,
                    isWritable: this.isCreator,
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
            room.disableDeviceInputs = !this.isCreator;
            cursorAdapter.setRoom(room);
            setDefaultPptData(pptDatas, room);
            room.setMemberState({
                pencilOptions: {
                    disableBezier: false,
                    sparseHump: 1.0,
                    sparseWidth: 1.0,
                    enableDrawPoint: false,
                },
            });
            if (room.state.broadcastState) {
                this.updateViewMode(room.state.broadcastState.mode);
            }
            this.updateRoom(room);
            if (NODE_ENV === "development") {
                (window as any).room = room;
            }
        } catch (error) {
            console.error(error);
        }
    }

    destroy() {
        if (this.room) {
            this.room.callbacks.off();
        }
        if (NODE_ENV === "development") {
            (window as any).room = null;
        }
        console.log(`Whiteboard unloaded: ${this.whiteboardUUID}`);
    }
}

export function useWhiteboardStore(isCreator: boolean): WhiteboardStore {
    const [whiteboardStore] = useState(() => {
        if (!globalStore.userUUID) {
            throw new Error("Missing userUUID");
        }

        if (!globalStore.whiteboardUUID || !globalStore.whiteboardToken) {
            throw new Error("Missing Whiteboard UUID and Token");
        }

        return new WhiteboardStore({
            userUUID: globalStore.userUUID,
            whiteboardUUID: globalStore.whiteboardUUID,
            whiteboardToken: globalStore.whiteboardToken,
            isCreator,
        });
    });

    useEffect(() => {
        whiteboardStore.joinWhiteboardRoom();

        return () => {
            whiteboardStore.destroy();
        };
        // only join room once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return whiteboardStore;
}

function setDefaultPptData(pptDatas: string[], room: Room): void {
    const docs: PPTDataType[] = (room.state.globalState as any).docs;
    if (docs && docs.length > 1) {
        return;
    }
    if (pptDatas.length > 0) {
        for (let pptData of pptDatas) {
            const sceneId = uuidv4();
            const scenes = JSON.parse(pptData);
            const documentFile: PPTDataType = {
                active: false,
                id: sceneId,
                pptType: PPTType.dynamic,
                data: scenes,
            };
            const docs = (room.state.globalState as any).docs;
            if (docs?.length > 0) {
                const newDocs = [documentFile, ...docs];
                room.setGlobalState({ docs: newDocs });
            } else {
                room.setGlobalState({ docs: [documentFile] });
            }
            room.putScenes(`/${room.uuid}/${sceneId}`, scenes);
        }
    }
}

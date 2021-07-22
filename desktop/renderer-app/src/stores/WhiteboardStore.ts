import { makeAutoObservable, observable, runInAction } from "mobx";
import {
    createPlugins,
    DefaultHotKeys,
    DeviceType,
    Room,
    RoomPhase,
    RoomState,
    ViewMode,
    WhiteWebSdk,
} from "white-web-sdk";
import { videoPlugin } from "@netless/white-video-plugin";
import { audioPlugin } from "@netless/white-audio-plugin";
import { CursorTool } from "@netless/cursor-tool";
import { NETLESS, NODE_ENV } from "../constants/Process";
import { globalStore } from "./GlobalStore";
import { isMobile, isWindows } from "react-device-detect";
import { getCoursewarePreloader } from "../utils/CoursewarePreloader";
import { debounce } from "lodash-es";

export class WhiteboardStore {
    public room: Room | null = null;
    public phase: RoomPhase = RoomPhase.Connecting;
    public viewMode: ViewMode | null = null;
    public isWritable: boolean;
    public isShowPreviewPanel = false;
    public isFileOpen = false;
    public isKicked = false;

    /** is room Creator */
    public readonly isCreator: boolean;

    public constructor(config: { isCreator: boolean }) {
        this.isCreator = config.isCreator;
        this.isWritable = config.isCreator;

        makeAutoObservable<this, "preloadPPTResource">(this, {
            room: observable.ref,
            preloadPPTResource: false,
        });
    }

    public updateRoom = (room: Room): void => {
        this.room = room;
    };

    public updatePhase = (phase: RoomPhase): void => {
        this.phase = phase;
    };

    public updateViewMode = (viewMode: ViewMode): void => {
        this.viewMode = viewMode;
    };

    public updateWritable = async (isWritable: boolean): Promise<void> => {
        const oldWritable = this.isWritable;

        this.isWritable = isWritable;

        if (oldWritable !== isWritable && this.room) {
            await this.room.setWritable(isWritable);
            this.room.disableDeviceInputs = !isWritable;
            if (isWritable) {
                this.room.disableSerialization = false;
            }
        }
    };

    public setFileOpen = (open: boolean): void => {
        this.isFileOpen = open;
    };

    public toggleFileOpen = (): void => {
        this.isFileOpen = !this.isFileOpen;
    };

    public showPreviewPanel = (): void => {
        this.isShowPreviewPanel = true;
    };

    public setPreviewPanel = (show: boolean): void => {
        this.isShowPreviewPanel = show;
    };

    private preloadPPTResource = debounce(async (pptSrc: string): Promise<void> => {
        // TODO: the parse PPT URL method will split into preload method, that for consistent code style with FLAT_Web.
        const pptFiles = /(static|dynamic)Convert\/([0-9a-f]{32})\//.exec(pptSrc);
        if (!pptFiles) return;
        const [, pptType, taskUUID] = pptFiles;
        await getCoursewarePreloader().preload(taskUUID, pptType as "dynamic" | "static");
    }, 2000);

    public async joinWhiteboardRoom(): Promise<void> {
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

        let deviceType: DeviceType;
        if (isWindows) {
            deviceType = DeviceType.Surface;
        } else {
            if (isMobile) {
                deviceType = DeviceType.Touch;
            } else {
                deviceType = DeviceType.Desktop;
            }
        }
        const whiteWebSdk = new WhiteWebSdk({
            appIdentifier: NETLESS.APP_IDENTIFIER,
            plugins: plugins,
            deviceType: deviceType,
            pptParams: {
                useServerWrap: true,
            },
        });

        const cursorName = globalStore.userInfo?.name;
        const cursorAdapter = new CursorTool();

        const room = await whiteWebSdk.joinRoom(
            {
                uuid: globalStore.whiteboardRoomUUID,
                roomToken: globalStore.whiteboardRoomToken,
                cursorAdapter: cursorAdapter,
                region: globalStore.region ?? undefined,
                userPayload: {
                    userId: globalStore.userUUID,
                    cursorName,
                },
                floatBar: true,
                isWritable: this.isWritable,
                disableNewPencil: false,
                hotKeys: {
                    ...DefaultHotKeys,
                    changeToSelector: "s",
                    changeToLaserPointer: "z",
                    changeToPencil: "p",
                    changeToRectangle: "r",
                    changeToEllipse: "c",
                    changeToEraser: "e",
                    changeToText: "t",
                    changeToStraight: "l",
                    changeToArrow: "a",
                    changeToHand: "h",
                },
            },
            {
                onPhaseChanged: phase => {
                    this.updatePhase(phase);
                },
                onRoomStateChanged: async (modifyState: Partial<RoomState>): Promise<void> => {
                    if (modifyState.broadcastState) {
                        this.updateViewMode(modifyState.broadcastState.mode);
                    }

                    // TODO: That is temporarily plan, use RTM emit message is follow-up plan.
                    try {
                        const pptSrc = modifyState.sceneState?.scenes[0]?.ppt?.src;
                        if (pptSrc) {
                            try {
                                await this.preloadPPTResource(pptSrc);
                            } catch (err) {
                                console.log(err);
                            }
                        }
                    } catch (err) {
                        console.log(err);
                    }
                },
                onDisconnectWithError: error => {
                    this.preloadPPTResource.cancel();
                    console.error(error);
                },
                onKickedWithReason: reason => {
                    if (
                        reason === "kickByAdmin" ||
                        reason === "roomDelete" ||
                        reason === "roomBan"
                    ) {
                        // Kick in-room joiners when creator cancels room
                        // from the homepage list menu
                        runInAction(() => {
                            // Room creator do not need to listen to this event
                            // as they are in control of exiting room.
                            // Listening to this may interrupt the stop room process.
                            if (!this.isCreator) {
                                this.isKicked = true;
                            }
                        });
                    }
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

    public destroy(): void {
        if (this.room) {
            this.preloadPPTResource.cancel();
            this.room.callbacks.off();
        }
        if (NODE_ENV === "development") {
            (window as any).room = null;
        }
        console.log(`Whiteboard unloaded: ${globalStore.whiteboardRoomUUID}`);
    }
}

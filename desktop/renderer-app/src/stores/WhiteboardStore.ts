import "video.js/dist/video-js.css";

import { BuiltinApps, WindowManager } from "@netless/window-manager";
import { makeAutoObservable, observable, runInAction } from "mobx";
import {
    createPlugins,
    DefaultHotKeys,
    DeviceType,
    Room,
    RoomPhase,
    RoomState,
    SceneDefinition,
    ViewMode,
    ViewVisionMode,
    WhiteWebSdk,
} from "white-web-sdk";
import {
    PluginId as VideoJsPluginId,
    videoJsPlugin,
    PluginContext as VideoJsPluginContext,
} from "@netless/video-js-plugin";
import { CursorTool } from "@netless/cursor-tool";
import { NETLESS, NODE_ENV } from "../constants/Process";
import { globalStore } from "./GlobalStore";
import { isMobile, isWindows } from "react-device-detect";
import { getCoursewarePreloader } from "../utils/CoursewarePreloader";
import { debounce } from "lodash-es";
import { RoomType } from "../../../../packages/flat-components/src/types/room";

export class WhiteboardStore {
    public room: Room | null = null;
    public phase: RoomPhase = RoomPhase.Connecting;
    public viewMode: ViewMode | null = null;
    public windowManager: WindowManager | null = null;
    public isWritable: boolean;
    public isShowPreviewPanel = false;
    public isFileOpen = false;
    public isKicked = false;
    public isFocusWindow = false;
    public isWindowMaximization = false;
    public currentSceneIndex = 0;
    public scenesCount = 0;
    public smallClassRatio = 8.3 / 16;
    public otherClassRatio = 10.46 / 16;

    /** is room Creator */
    public readonly isCreator: boolean;
    public readonly roomType: RoomType;

    public constructor(config: { isCreator: boolean; roomType: RoomType }) {
        this.isCreator = config.isCreator;
        this.isWritable = config.isCreator;
        this.roomType = config.roomType;

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

    public updateWindowManager = (windowManager: WindowManager): void => {
        this.windowManager = windowManager;
    };

    public updateCurrentSceneIndex = (currentSceneIndex: number): void => {
        this.currentSceneIndex = currentSceneIndex;
    };

    public updateScenesCount = (scenesCount: number): void => {
        this.scenesCount = scenesCount;
    };

    public updateWindowMaximization = (isMaximization: boolean): void => {
        this.isWindowMaximization = isMaximization;
    };

    public updateFocusWindowManager = (isFocus: boolean): void => {
        this.isFocusWindow = isFocus;
    };

    public updateWhiteboardResize = (): number => {
        // the Ratio of whiteboard compute method is height / width.
        if (this.roomType === RoomType.SmallClass) {
            return this.smallClassRatio;
        }
        return this.otherClassRatio;
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

    public switchMainViewToWriter = async (): Promise<void> => {
        if (this.windowManager && this.isFocusWindow) {
            await this.windowManager.switchMainViewToWriter();
        }
    };

    public addMainViewScene = (): void => {
        if (this.room && this.windowManager) {
            const currentScene = this.currentSceneIndex + 1;
            const scenePath = this.room.state.sceneState.scenePath;
            const path = this.dirName(scenePath);

            this.room.putScenes(path, [{}], currentScene);
            this.windowManager.setMainViewSceneIndex(this.currentSceneIndex + 1);
        }
    };

    public preMainViewScene = (): void => {
        if (this.windowManager && this.currentSceneIndex > 0) {
            this.windowManager.setMainViewSceneIndex(this.currentSceneIndex - 1);
        }
    };

    public nextMainViewScene = (): void => {
        if (this.windowManager && this.currentSceneIndex < this.scenesCount - 1) {
            this.windowManager.setMainViewSceneIndex(this.currentSceneIndex + 1);
        }
    };

    private preloadPPTResource = debounce(async (pptSrc: string): Promise<void> => {
        await getCoursewarePreloader().preload(pptSrc);
    }, 2000);

    public openDocsFileInWindowManager = async (
        scenePath: string,
        title: string,
        scenes: SceneDefinition[],
    ): Promise<void> => {
        await this.windowManager?.addApp({
            kind: BuiltinApps.DocsViewer,
            options: {
                scenePath,
                title,
                scenes: scenes,
            },
        });
    };

    public openMediaFileInWindowManager = async (
        resourceSrc: string,
        title: string,
    ): Promise<void> => {
        await this.windowManager?.addApp({
            kind: BuiltinApps.MediaPlayer,
            options: {
                title,
            },
            attributes: {
                src: resourceSrc,
            },
        });
    };

    public onMainViewModeChange = (): void => {
        this.windowManager?.emitter.on("mainViewModeChange", mode => {
            const isWindow = mode !== ViewVisionMode.Writable;
            this.updateFocusWindowManager(isWindow);
            if (!isWindow && this.room) {
                this.updateCurrentSceneIndex(this.room.state.sceneState.index);
                this.updateScenesCount(this.room.state.sceneState.scenes.length);
            }
        });
    };

    public onWindowManagerBoxStateChange = (): void => {
        this.windowManager?.emitter.on("boxStateChange", mode => {
            const isMaximization = mode === "maximized";
            this.updateWindowMaximization(isMaximization);
        });
    };

    public async joinWhiteboardRoom(): Promise<void> {
        if (!globalStore.userUUID) {
            throw new Error("Missing userUUID");
        }

        if (!globalStore.whiteboardRoomUUID || !globalStore.whiteboardRoomToken) {
            throw new Error("Missing Whiteboard UUID and Token");
        }

        const plugins = createPlugins({ [VideoJsPluginId]: videoJsPlugin() });
        const videoJsPluginContext: Partial<VideoJsPluginContext> = { enable: true, verbose: true };
        plugins.setPluginContext(VideoJsPluginId, videoJsPluginContext);

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
                useMultiViews: true,
                invisiblePlugins: [WindowManager],
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

                    if (
                        this.room &&
                        this.windowManager?.mainView.mode === ViewVisionMode.Writable
                    ) {
                        this.updateCurrentSceneIndex(this.room.state.sceneState.index);
                        this.updateScenesCount(this.room.state.sceneState.scenes.length);
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

        this.updateCurrentSceneIndex(room.state.sceneState.index);

        this.updateScenesCount(room.state.sceneState.scenes.length);

        if (this.room) {
            const windowManager = this.room.getInvisiblePlugin(WindowManager.kind) as WindowManager;
            this.updateWindowManager(windowManager);
        }

        if (NODE_ENV === "development") {
            (window as any).room = room;
            (window as any).manager = this.windowManager;
        }
    }

    public destroy(): void {
        this.preloadPPTResource.cancel();
        this.windowManager?.destroy();
        this.room?.callbacks.off();

        if (NODE_ENV === "development") {
            (window as any).room = null;
            (window as any).manager = null;
        }
        console.log(`Whiteboard unloaded: ${globalStore.whiteboardRoomUUID}`);
    }

    private dirName = (scenePath: string): string => {
        return scenePath.slice(0, scenePath.lastIndexOf("/"));
    };
}

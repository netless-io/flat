import "video.js/dist/video-js.css";

import type { Attributes as SlideAttributes } from "@netless/app-slide";
import { AddAppParams, BuiltinApps, WindowManager } from "@netless/window-manager";
import { message } from "antd";
import { i18n } from "i18next";
import { v4 as v4uuid } from "uuid";
import { debounce } from "lodash-es";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { isMobile, isWindows } from "react-device-detect";
import {
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
import { RoomType } from "../../../../packages/flat-components/src/types/room";
import { CLOUD_STORAGE_DOMAIN, NETLESS, NODE_ENV } from "../constants/process";
import { CloudStorageFile, CloudStorageStore } from "../pages/CloudStoragePage/store";
import { getCoursewarePreloader } from "../utils/courseware-preloader";
import { globalStore } from "./global-store";
import { getFileExt, isPPTX } from "../utils/file";
import { queryConvertingTaskStatus } from "../api-middleware/courseware-converting";
import { convertFinish } from "../api-middleware/flatServer/storage";
import { ServerRequestError } from "../utils/error/server-request-error";
import { RequestErrorCode } from "../constants/error-code";

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
    public readonly getRoomType: () => RoomType;
    public readonly i18n: i18n;
    public readonly onDrop: (file: File) => void;

    public readonly cloudStorageStore: CloudStorageStore;

    public constructor(config: {
        isCreator: boolean;
        getRoomType: () => RoomType;
        i18n: i18n;
        onDrop: (file: File) => void;
    }) {
        this.isCreator = config.isCreator;
        this.isWritable = config.isCreator;
        this.getRoomType = config.getRoomType;
        this.i18n = config.i18n;
        this.onDrop = config.onDrop;

        makeAutoObservable<this, "preloadPPTResource">(this, {
            room: observable.ref,
            preloadPPTResource: false,
        });

        this.cloudStorageStore = new CloudStorageStore({
            compact: true,
            insertCourseware: this.insertCourseware,
            i18n: this.i18n,
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

    public getWhiteboardRatio = (): number => {
        // the Ratio of whiteboard compute method is height / width.
        if (this.getRoomType() === RoomType.SmallClass) {
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

    public addMainViewScene = async (): Promise<void> => {
        if (this.room && this.windowManager) {
            const currentScene = this.currentSceneIndex + 1;
            const scenePath = this.room.state.sceneState.scenePath;
            const path = this.dirName(scenePath);

            this.room.putScenes(path, [{}], currentScene);
            await this.windowManager.setMainViewSceneIndex(this.currentSceneIndex + 1);
        }
    };

    public preMainViewScene = async (): Promise<void> => {
        if (this.windowManager && this.currentSceneIndex > 0) {
            await this.windowManager.setMainViewSceneIndex(this.currentSceneIndex - 1);
        }
    };

    public nextMainViewScene = async (): Promise<void> => {
        if (this.windowManager && this.currentSceneIndex < this.scenesCount - 1) {
            await this.windowManager.setMainViewSceneIndex(this.currentSceneIndex + 1);
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
        if (this.windowManager) {
            const { scenesWithoutPPT, taskId, url } = this.makeSlideParams(scenes);
            try {
                if (taskId && url) {
                    await this.windowManager.addApp({
                        kind: "Slide",
                        options: {
                            scenePath,
                            title,
                            scenes: scenesWithoutPPT,
                        },
                        attributes: {
                            taskId,
                            url,
                        } as SlideAttributes,
                    });
                } else {
                    await this.windowManager.addApp({
                        kind: BuiltinApps.DocsViewer,
                        options: {
                            scenePath,
                            title,
                            scenes,
                        },
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }
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

    public addApp = async (config: AddAppParams): Promise<void> => {
        await this.windowManager?.addApp(config);
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

    public onWindowManagerBoxStateChange = (
        initialBoxState?: "normal" | "minimized" | "maximized",
    ): void => {
        this.updateWindowMaximization(Boolean(initialBoxState === "maximized"));

        this.windowManager?.emitter.on("boxStateChange", mode => {
            const isMaximization = mode === "maximized";
            this.updateWindowMaximization(isMaximization);
        });
    };

    public destroyWindowManager = (): void => {
        this.windowManager?.destroy();
        this.windowManager = null;
    };

    public async joinWhiteboardRoom(): Promise<void> {
        if (!globalStore.userUUID) {
            throw new Error("Missing userUUID");
        }

        if (!globalStore.whiteboardRoomUUID || !globalStore.whiteboardRoomToken) {
            throw new Error("Missing Whiteboard UUID and Token");
        }

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
            deviceType: deviceType,
            pptParams: {
                useServerWrap: true,
            },
            useMobXState: true,
        });

        const cursorName = globalStore.userInfo?.name;

        const room = await whiteWebSdk.joinRoom(
            {
                uuid: globalStore.whiteboardRoomUUID,
                roomToken: globalStore.whiteboardRoomToken,
                region: globalStore.region ?? undefined,
                userPayload: {
                    uid: globalStore.userUUID,
                    nickName: cursorName,
                    // @deprecated
                    userId: globalStore.userUUID,
                    // @deprecated
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
                uid: globalStore.userUUID,
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
        this.destroyWindowManager();
        this.room?.callbacks.off();

        if (NODE_ENV === "development") {
            (window as any).room = null;
            (window as any).manager = null;
        }
        console.log(`Whiteboard unloaded: ${globalStore.whiteboardRoomUUID}`);
    }

    private makeSlideParams(scenes: SceneDefinition[]): {
        scenesWithoutPPT: SceneDefinition[];
        taskId: string;
        url: string;
    } {
        const scenesWithoutPPT: SceneDefinition[] = [];
        let taskId = "";
        let url = "";

        // e.g. "ppt(x)://cdn/prefix/dynamicConvert/{taskId}/1.slide"
        const pptSrcRE = /^pptx?(?<prefix>:\/\/\S+?dynamicConvert)\/(?<taskId>\w+)\//;

        for (const { name, ppt } of scenes) {
            // make sure scenesWithoutPPT.length === scenes.length
            scenesWithoutPPT.push({ name });

            if (!ppt || !ppt.src.startsWith("ppt")) {
                continue;
            }
            const match = pptSrcRE.exec(ppt.src);
            if (!match || !match.groups) {
                continue;
            }
            taskId = match.groups.taskId;
            url = "https" + match.groups.prefix;
            break;
        }

        return { scenesWithoutPPT, taskId, url };
    }

    private dirName = (scenePath: string): string => {
        return scenePath.slice(0, scenePath.lastIndexOf("/"));
    };

    public insertCourseware = async (file: CloudStorageFile): Promise<void> => {
        if (file.convert === "converting") {
            void message.warn(this.i18n.t("in-the-process-of-transcoding-tips"));
            return;
        }

        void message.info(this.i18n.t("inserting-courseware-tips"));

        const ext = getFileExt(file.fileName);

        switch (ext) {
            case "jpg":
            case "jpeg":
            case "png":
            case "webp": {
                await this.insertImage(file);
                break;
            }
            case "mp3":
            case "mp4": {
                await this.insertMediaFile(file);
                break;
            }
            case "doc":
            case "docx":
            case "ppt":
            case "pptx":
            case "pdf": {
                await this.insertDocs(file);
                break;
            }
            case "ice": {
                await this.insertIce(file);
                break;
            }
            case "vf": {
                await this.insertVf(file);
                break;
            }
            default: {
                console.log(
                    `[cloud storage]: insert unknown format "${file.fileName}" into whiteboard`,
                );
            }
        }

        if (this.cloudStorageStore.onCoursewareInserted) {
            this.cloudStorageStore.onCoursewareInserted();
        }
    };

    public insertImage = async (file: CloudStorageFile): Promise<void> => {
        await this.switchMainViewToWriter();

        const room = this.room;
        if (!room) {
            return;
        }

        // shrink the image a little to fit the screen
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;

        let width: number;
        let height: number;

        if (file.fileURL) {
            ({ width, height } = await new Promise<{ width: number; height: number }>(resolve => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () =>
                    resolve({ width: window.innerWidth, height: window.innerHeight });
                img.src = file.fileURL;
            }));
        } else {
            ({ innerWidth: width, innerHeight: height } = window);
        }

        let scale = 1;
        if (width > maxWidth || height > maxHeight) {
            scale = Math.min(maxWidth / width, maxHeight / height);
        }

        const uuid = v4uuid();
        room.insertImage({
            uuid,
            ...room.state.cameraState,
            width: Math.floor(width * scale),
            height: Math.floor(height * scale),
            locked: false,
        });
        room.completeImageUpload(uuid, file.fileURL);
    };

    public insertMediaFile = async (file: CloudStorageFile): Promise<void> => {
        await this.openMediaFileInWindowManager(file.fileURL, file.fileName);
    };

    public insertDocs = async (file: CloudStorageFile): Promise<void> => {
        const room = this.room;
        if (!room) {
            return;
        }

        const { taskUUID, taskToken, region } = file;
        const convertingStatus = await queryConvertingTaskStatus({
            taskUUID,
            taskToken,
            dynamic: isPPTX(file.fileName),
            region,
        });

        if (file.convert !== "success") {
            if (convertingStatus.status === "Finished" || convertingStatus.status === "Fail") {
                try {
                    await convertFinish({ fileUUID: file.fileUUID, region });
                } catch (e) {
                    if (
                        e instanceof ServerRequestError &&
                        e.errorCode === RequestErrorCode.FileIsConverted
                    ) {
                        // ignore this error
                        // there's another `convertFinish()` call in ./store.tsx
                        // we call this api in two places to make sure the file is correctly converted (in server)
                    } else {
                        console.error(e);
                    }
                }
                if (convertingStatus.status === "Fail") {
                    void message.error(
                        this.i18n.t("transcoding-failure-reason", {
                            reason: convertingStatus.failedReason,
                        }),
                    );
                }
            } else {
                message.destroy();
                void message.warn(this.i18n.t("in-the-process-of-transcoding-tips"));
                return;
            }
        } else if (convertingStatus.status === "Finished" && convertingStatus.progress) {
            const scenes: SceneDefinition[] = convertingStatus.progress.convertedFileList.map(
                (f, i) => ({
                    name: `${i + 1}`,
                    ppt: {
                        src: f.conversionFileUrl,
                        width: f.width,
                        height: f.height,
                        previewURL: f.preview,
                    },
                }),
            );
            const uuid = v4uuid();
            const scenesPath = `/${taskUUID}/${uuid}`;
            await this.openDocsFileInWindowManager(scenesPath, file.fileName, scenes);
        } else {
            void message.error(this.i18n.t("unable-to-insert-courseware"));
        }
    };

    public insertIce = async (file: CloudStorageFile): Promise<void> => {
        try {
            const src =
                CLOUD_STORAGE_DOMAIN.replace("[region]", file.region) +
                new URL(file.fileURL).pathname.replace(/[^/]+$/, "") +
                "resource/index.html";

            if (src && this.windowManager) {
                await this.windowManager.addApp({
                    kind: "IframeBridge",
                    options: {
                        title: file.fileName,
                    },
                    attributes: {
                        src,
                    },
                });
            } else {
                void message.error(this.i18n.t("unable-to-insert-courseware"));
            }
        } catch (e) {
            console.error(e);
            void message.error(this.i18n.t("unable-to-insert-courseware"));
        }
    };

    public insertVf = async (file: CloudStorageFile): Promise<void> => {
        try {
            if (this.windowManager) {
                await this.windowManager.addApp({
                    kind: "IframeBridge",
                    options: {
                        title: file.fileName,
                    },
                    attributes: {
                        src: file.fileURL,
                    },
                });
            } else {
                void message.error(this.i18n.t("unable-to-insert-courseware"));
            }
        } catch (e) {
            console.error(e);
            void message.error(this.i18n.t("unable-to-insert-courseware"));
        }
    };
}

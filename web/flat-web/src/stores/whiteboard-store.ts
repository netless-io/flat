import "video.js/dist/video-js.css";

import type { i18n } from "i18next";
import { FastboardApp, createFastboard } from "@netless/fastboard-react";
import { AddAppParams, BuiltinApps, WindowManager } from "@netless/window-manager";
import { message } from "antd";
import { debounce } from "lodash-es";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { isMobile, isWindows } from "react-device-detect";
import { v4 as v4uuid } from "uuid";
import {
    AnimationMode,
    DeviceType,
    Room,
    RoomPhase,
    RoomState,
    SceneDefinition,
    ViewMode,
} from "white-web-sdk";
import { snapshot } from "@netless/white-snapshot";

import { queryConvertingTaskStatus } from "../api-middleware/courseware-converting";
import { RoomType } from "../api-middleware/flatServer/constants";
import { convertFinish } from "../api-middleware/flatServer/storage";
import { RequestErrorCode } from "../constants/error-code";
import { CLOUD_STORAGE_DOMAIN, NETLESS } from "../constants/process";
import { CloudStorageFile, CloudStorageStore } from "../pages/CloudStoragePage/store";
import { coursewarePreloader } from "../utils/courseware-preloader";
import { ServerRequestError } from "../utils/error/server-request-error";
import { getFileExt, isPPTX } from "../utils/file";
import { globalStore } from "./GlobalStore";

export class WhiteboardStore {
    public fastboardAPP: FastboardApp | null = null;
    public room: Room | null = null;
    public phase: RoomPhase = RoomPhase.Connecting;
    public viewMode: ViewMode | null = null;
    public windowManager: WindowManager | null = null;
    public isWritable: boolean;
    public isShowPreviewPanel = false;
    public isFileOpen = false;
    public isKicked = false;
    public isWindowMaximization = false;
    public isRightSideClose = false;
    public currentSceneIndex = 0;
    public scenesCount = 0;
    public smallClassRatio = 8.3 / 16;
    public otherClassRatio = 10.46 / 16;
    public smallClassAvatarWrapMaxWidth = 0;

    /** is room Creator */
    public readonly isCreator: boolean;
    public readonly i18n: i18n;
    public readonly getRoomType: () => RoomType;
    public readonly onDrop: (file: File) => void;

    public readonly cloudStorageStore: CloudStorageStore;

    public constructor(config: {
        isCreator: boolean;
        i18n: i18n;
        getRoomType: () => RoomType;
        onDrop: (file: File) => void;
    }) {
        this.isCreator = config.isCreator;
        this.isWritable = config.isCreator;
        this.i18n = config.i18n;
        this.getRoomType = config.getRoomType;
        this.onDrop = config.onDrop;

        makeAutoObservable<this, "preloadPPTResource">(this, {
            room: observable.ref,
            preloadPPTResource: false,
            fastboardAPP: false,
        });

        this.cloudStorageStore = new CloudStorageStore({
            compact: true,
            i18n: this.i18n,
            insertCourseware: this.insertCourseware,
        });

        // Whiteboard debugging
        const flatUA =
            process.env.FLAT_UA || (this.i18n.t("app-name") || "").replace(/s+/g, "_").slice(0, 50);
        window.__netlessUA =
            (window.__netlessUA || "") +
            ` FLAT/${flatUA}_${process.env.FLAT_REGION}@${process.env.VERSION} `;
    }

    public updateFastboardAPP = (whiteboardApp: FastboardApp): void => {
        this.fastboardAPP = whiteboardApp;
    };

    public updateRoom = (room: Room): void => {
        this.room = room;
    };

    public updateWindowManager = (manager: WindowManager): void => {
        this.windowManager = manager;
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
            try {
                await this.room.setWritable(isWritable);
                this.room.disableDeviceInputs = !isWritable;
                if (isWritable) {
                    this.room.disableSerialization = false;
                }
            } catch {
                /* ignored */
            }
        }
    };

    public updateWindowMaximization = (isMaximization: boolean): void => {
        this.isWindowMaximization = isMaximization;
    };

    public updateSmallClassAvatarWrapMaxWidth = (smallClassAvatarWrapMaxWidth: number): void => {
        this.smallClassAvatarWrapMaxWidth = smallClassAvatarWrapMaxWidth;
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

    public setRightSideClose = (close: boolean): void => {
        this.isRightSideClose = close;
    };

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
                        },
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
        try {
            await this.windowManager?.addApp({
                kind: "Plyr",
                options: {
                    title,
                },
                attributes: {
                    src: resourceSrc,
                },
            });
        } catch (err) {
            console.log(err);
        }
    };

    public addApp = async (config: AddAppParams): Promise<void> => {
        await this.windowManager?.addApp(config);
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

        const cursorName = globalStore.userInfo?.name;

        const fastboardAPP = await createFastboard({
            sdkConfig: {
                appIdentifier: NETLESS.APP_IDENTIFIER,
                deviceType: deviceType,
                region: globalStore.region ?? "cn-hz",
                pptParams: {
                    useServerWrap: true,
                },
            },
            managerConfig: {
                cursor: true,
                chessboard: false,
                containerSizeRatio: this.getWhiteboardRatio(),
                collectorStyles: {
                    position: "absolute",
                    bottom: "8px",
                },
            },
            joinRoom: {
                uuid: globalStore.whiteboardRoomUUID,
                roomToken: globalStore.whiteboardRoomToken,
                region: globalStore.region ?? undefined,
                userPayload: {
                    uid: globalStore.userUUID,
                    nickName: globalStore.userInfo?.name,
                    // @deprecated
                    userId: globalStore.userUUID,
                    // @deprecated
                    cursorName,
                },
                floatBar: true,
                disableEraseImage: true,
                isWritable: this.isWritable,
                invisiblePlugins: [WindowManager],
                uid: globalStore.userUUID,
                callbacks: {
                    onPhaseChanged: phase => this.updatePhase(phase),
                    onRoomStateChanged: async (modifyState: Partial<RoomState>): Promise<void> => {
                        if (modifyState.broadcastState) {
                            this.updateViewMode(modifyState.broadcastState.mode);
                        }

                        const pptSrc = modifyState.sceneState?.scenes[0]?.ppt?.src;
                        if (pptSrc) {
                            try {
                                await this.preloadPPTResource(pptSrc);
                            } catch (err) {
                                console.log(err);
                            }
                        }
                    },
                    onDisconnectWithError: error => {
                        void message.error(this.i18n.t("on-disconnect-with-error"));
                        console.error(error);
                        this.preloadPPTResource.cancel();
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
            },
        });

        // Disable scale, fix height.
        fastboardAPP.manager.mainView.setCameraBound({
            damping: 1,
            centerX: 0,
            centerY: 0,
            minContentMode: () => 1,
            maxContentMode: () => 1,
            width: 0,
            height: 9999,
        });

        this.updateFastboardAPP(fastboardAPP);

        const { room, manager } = fastboardAPP;

        this.updateRoom(room);

        this.updateWindowManager(manager);

        room.disableDeviceInputs = !this.isWritable;

        if (room.state.broadcastState) {
            this.updateViewMode(room.state.broadcastState.mode);
        }

        this.scrollToTopOnce();

        if (process.env.DEV) {
            (window as any).room = room;
            (window as any).manager = manager;
        }
    }

    private scrollToTopOnce(): void {
        const { room, windowManager } = this;
        if (!room || !windowManager) {
            return;
        }
        if (!room.state.globalState || !(room.state.globalState as any).scrollToTop) {
            room.setGlobalState({ scrollToTop: true });
            windowManager.moveCamera({ centerY: -950, animationMode: AnimationMode.Immediately });
        }
    }

    public async destroy(): Promise<void> {
        this.preloadPPTResource.cancel();
        await this.fastboardAPP?.destroy();

        if (process.env.DEV) {
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

    private preloadPPTResource = debounce(async (pptSrc: string): Promise<void> => {
        await coursewarePreloader.preload(pptSrc);
    }, 2000);

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

    public insertImage = async (file: Pick<CloudStorageFile, "fileURL">): Promise<void> => {
        const windowManager = this.windowManager;
        if (!windowManager) {
            return;
        }

        // 1. shrink the image a little to fit the screen
        const maxWidth = window.innerWidth * 0.6;

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
        if (width > maxWidth) {
            scale = maxWidth / width;
        }

        const uuid = v4uuid();
        const { centerX, centerY } = windowManager.cameraState;
        width *= scale;
        height *= scale;
        windowManager.mainView.insertImage({
            uuid,
            centerX,
            centerY,
            width: Math.floor(width),
            height: Math.floor(height),
            locked: false,
        });

        windowManager.mainView.completeImageUpload(uuid, file.fileURL);

        // Prevent scale.
        // // 2. move camera to fit image height
        // width /= 0.8;
        // height /= 0.8;
        // windowManager.moveCameraToContain({
        //     originX: centerX - width / 2,
        //     originY: centerY - height / 2,
        //     width: width,
        //     height: height,
        // });
    };

    public insertMediaFile = async (file: CloudStorageFile): Promise<void> => {
        await this.openMediaFileInWindowManager(file.fileURL, file.fileName);
    };

    public insertDocs = async (file: CloudStorageFile): Promise<void> => {
        const room = this.room;
        if (!room) {
            return;
        }

        const { taskUUID, taskToken, region, resourceType } = file;
        const convertingStatus = await queryConvertingTaskStatus({
            taskUUID,
            taskToken,
            dynamic: isPPTX(file.fileName),
            region,
            projector: resourceType === "WhiteboardProjector",
        });

        if (file.convert !== "success") {
            if (convertingStatus.status === "Finished" || convertingStatus.status === "Fail") {
                try {
                    await convertFinish({ fileUUID: file.fileUUID, region: file.region });
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
                            reason: convertingStatus.errorMessage,
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
        } else if (convertingStatus.status === "Finished" && convertingStatus.prefix) {
            await this.fastboardAPP?.insertDocs({
                fileType: "pptx",
                title: file.fileName,
                scenePath: `/${taskUUID}/${v4uuid()}`,
                taskId: taskUUID,
                url: convertingStatus.prefix,
            });
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

    public getSaveAnnotationImages(): Array<() => Promise<HTMLCanvasElement | null>> {
        if (this.fastboardAPP) {
            const { manager } = this.fastboardAPP;
            return manager.sceneState.scenes.map(scene => {
                const dir = manager.mainViewSceneDir;
                // Because manager hacks room.fillSceneSnapshot, we need to hack it back.
                const room = {
                    state: manager,
                    fillSceneSnapshot: manager.mainView.fillSceneSnapshot.bind(manager.mainView),
                } as any;
                return () =>
                    snapshot(room, {
                        scenePath: dir + scene.name,
                        crossorigin: true,
                    });
            });
        } else {
            return [];
        }
    }
}

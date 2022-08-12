import "video.js/dist/video-js.css";

import { FlatI18n } from "@netless/flat-i18n";
import { FastboardApp } from "@netless/fastboard-react";
import { AddAppParams, BuiltinApps, WindowManager } from "@netless/window-manager";
import { message } from "antd";
import { debounce } from "lodash-es";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { v4 as v4uuid } from "uuid";
import {
    ApplianceNames,
    AnimationMode,
    Room,
    RoomPhase,
    SceneDefinition,
    ViewMode,
} from "white-web-sdk";
import { snapshot } from "@netless/white-snapshot";
import { queryConvertingTaskStatus } from "../utils/courseware-converting";
import {
    RoomType,
    convertFinish,
    RequestErrorCode,
    Region,
    isServerRequestError,
} from "@netless/flat-server-api";
import { CloudStorageFile, CloudStorageStore } from "../cloud-storage-store";
import { coursewarePreloader } from "../utils/courseware-preloader";
import { getFileExt, isPPTX } from "../utils/file";
import { globalStore } from "../global-store";
import { ClassroomReplayEventData } from "../classroom-store/event";
import { IServiceWhiteboard } from "@netless/flat-services";
import { SideEffectManager } from "side-effect-manager";

export class WhiteboardStore {
    private sideEffect = new SideEffectManager();
    public whiteboard: IServiceWhiteboard;
    public fastboardAPP: FastboardApp<ClassroomReplayEventData> | null = null;
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
    public readonly getRoomType: () => RoomType;
    public readonly onDrop: (file: File) => void;

    public readonly cloudStorageStore: CloudStorageStore;

    public constructor(config: {
        whiteboard: IServiceWhiteboard;
        isCreator: boolean;
        isWritable: boolean;
        getRoomType: () => RoomType;
        onDrop: (file: File) => void;
    }) {
        this.whiteboard = config.whiteboard;
        this.isCreator = config.isCreator;
        this.isWritable = config.isWritable;
        this.getRoomType = config.getRoomType;
        this.onDrop = config.onDrop;

        makeAutoObservable<this, "preloadPPTResource" | "sideEffect">(this, {
            room: observable.ref,
            preloadPPTResource: false,
            fastboardAPP: false,
            sideEffect: false,
            whiteboard: false,
        });

        this.cloudStorageStore = new CloudStorageStore({
            compact: true,
            insertCourseware: this.insertCourseware,
        });

        this.sideEffect.push([
            config.whiteboard.events.on("kicked", () => {
                // Kick in-room joiners when creator cancels room
                // from the homepage list menu
                // Room creator do not need to listen to this event
                // as they are in control of exiting room.
                // Listening to this may interrupt the stop room process.
                if (!this.isCreator) {
                    runInAction(() => {
                        this.isKicked = true;
                    });
                }
            }),
            config.whiteboard.$Val.phase$.subscribe(() => {
                const room = this.getRoom();
                if (room) {
                    runInAction(() => {
                        this.phase = room.phase;
                    });
                }
            }),
        ]);
    }

    public updateFastboardAPP = (whiteboardApp: FastboardApp<ClassroomReplayEventData>): void => {
        this.fastboardAPP = whiteboardApp;
    };

    public updateRoom = (room: Room): void => {
        this.room = room;
    };

    public updateWindowManager = (manager: WindowManager): void => {
        this.windowManager = manager;
    };

    public updateWritable = async (isWritable: boolean): Promise<void> => {
        this.isWritable = isWritable;
        this.whiteboard.setAllowDrawing(isWritable);
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

    public async joinWhiteboardRoom(): Promise<FastboardApp<ClassroomReplayEventData>> {
        if (!globalStore.userUUID) {
            throw new Error("Missing userUUID");
        }

        if (!globalStore.whiteboardRoomUUID || !globalStore.whiteboardRoomToken) {
            throw new Error("Missing Whiteboard UUID and Token");
        }

        await this.whiteboard.joinRoom({
            roomID: globalStore.whiteboardRoomUUID,
            roomToken: globalStore.whiteboardRoomToken,
            region: globalStore.region ?? Region.CN_HZ,
            uid: globalStore.userUUID,
            nickName: globalStore.userInfo?.name ?? globalStore.userUUID,
            classroomType: this.getRoomType(),
            allowDrawing: this.isWritable,
        });

        // @TODO remove me after refactoring
        const fastboardAPP = await (this.whiteboard as any)._app$.value;

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

        this.scrollToTopOnce();

        if (process.env.DEV) {
            (window as any).room = room;
            (window as any).manager = manager;
        }

        return fastboardAPP;
    }

    private scrollToTopOnce(): void {
        const { room, windowManager } = this;
        if (!room || !windowManager) {
            return;
        }
        if (!room.isWritable) {
            return;
        }
        if (!room.state.globalState || !(room.state.globalState as any).scrollToTop) {
            room.setGlobalState({ scrollToTop: true });
            windowManager.moveCamera({ centerY: -950, animationMode: AnimationMode.Immediately });
        }
    }

    public async destroy(): Promise<void> {
        this.sideEffect.flushAll();
        this.preloadPPTResource.cancel();
        await this.whiteboard.destroy();

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
            void message.warn(FlatI18n.t("in-the-process-of-transcoding-tips"));
            return;
        }

        void message.info(FlatI18n.t("inserting-courseware-tips"));

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

        windowManager.mainView.setMemberState({ currentApplianceName: ApplianceNames.selector });
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
                        isServerRequestError(e) &&
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
                        FlatI18n.t("transcoding-failure-reason", {
                            reason: convertingStatus.errorMessage || "",
                        }),
                    );
                }
            } else {
                message.destroy();
                void message.warn(FlatI18n.t("in-the-process-of-transcoding-tips"));
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
            void message.error(FlatI18n.t("unable-to-insert-courseware"));
        }
    };

    public insertIce = async (file: CloudStorageFile): Promise<void> => {
        const CLOUD_STORAGE_DOMAIN = process.env.CLOUD_STORAGE_DOMAIN;
        if (!CLOUD_STORAGE_DOMAIN) {
            throw new Error("Missing env CLOUD_STORAGE_DOMAIN");
        }
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
                void message.error(FlatI18n.t("unable-to-insert-courseware"));
            }
        } catch (e) {
            console.error(e);
            void message.error(FlatI18n.t("unable-to-insert-courseware"));
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
                void message.error(FlatI18n.t("unable-to-insert-courseware"));
            }
        } catch (e) {
            console.error(e);
            void message.error(FlatI18n.t("unable-to-insert-courseware"));
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

    // @TODO remove me after refactoring
    private getRoom(): Room | null {
        return (this.whiteboard as any)._app$.value?.room ?? null;
    }
}

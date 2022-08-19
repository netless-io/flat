import "video.js/dist/video-js.css";

import { FlatI18n } from "@netless/flat-i18n";
import { FastboardApp } from "@netless/fastboard-react";
import { WindowManager } from "@netless/window-manager";
import { message } from "antd";
import { debounce } from "lodash-es";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { AnimationMode, Room, RoomPhase, ViewMode } from "white-web-sdk";
import { RoomType, Region, CloudFile, FileConvertStep } from "@netless/flat-server-api";
import { CloudStorageStore } from "../cloud-storage-store";
import { coursewarePreloader } from "../utils/courseware-preloader";
import { globalStore } from "../global-store";
import { ClassroomReplayEventData } from "../classroom-store/event";
import { FlatServices, IServiceWhiteboard } from "@netless/flat-services";
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

    private preloadPPTResource = debounce(async (pptSrc: string): Promise<void> => {
        await coursewarePreloader.preload(pptSrc);
    }, 2000);

    public insertCourseware = async (file: CloudFile): Promise<void> => {
        if (file.convertStep === FileConvertStep.Converting) {
            void message.warn(FlatI18n.t("in-the-process-of-transcoding-tips"));
            return;
        }

        void message.info(FlatI18n.t("inserting-courseware-tips"));

        const fileService = await FlatServices.getInstance().requestService("file");
        if (!fileService) {
            void message.error(FlatI18n.t("unable-to-insert-courseware"));
            return;
        }

        await fileService.insert(file);

        if (this.cloudStorageStore.onCoursewareInserted) {
            this.cloudStorageStore.onCoursewareInserted();
        }
    };

    public getSaveAnnotationImages(): Array<Promise<HTMLCanvasElement | null>> {
        return this.whiteboard.exportAnnotations();
    }

    // @TODO remove me after refactoring
    private getRoom(): Room | null {
        return (this.whiteboard as any)._app$.value?.room ?? null;
    }
}

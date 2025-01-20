import { createFastboard, createUI, FastboardApp, addManagerListener } from "@netless/fastboard";
import { DeviceType, RoomPhase, DefaultHotKeys } from "white-web-sdk";
import type { Camera, MemberState } from "white-web-sdk";
import type { FlatI18n } from "@netless/flat-i18n";
import {
    IServiceWhiteboard,
    IServiceWhiteboardJoinRoomConfig,
    IServiceWhiteboardPhase,
    Toaster,
} from "@netless/flat-services";
import { WindowManager } from "@netless/window-manager";
import { ReadonlyVal, Val, combine } from "value-enhancer";

import { registerColorShortcut } from "./color-shortcut";
import { injectCursor } from "./inject-cursor";

export { replayFastboard, register, stockedApps } from "@netless/fastboard";
export { FastboardFileInsert } from "./file-insert";

declare global {
    interface Window {
        __netlessUA?: string;
    }
}

interface FlatInfo {
    readonly platform?: string;
    readonly version?: string;
    readonly region?: string;
    readonly ua?: string;
}

export interface FastboardConfig {
    APP_ID?: string;
    toaster: Toaster;
    flatI18n: FlatI18n;
    flatInfo?: FlatInfo;
}

export class Fastboard extends IServiceWhiteboard {
    private toaster: Toaster;
    private flatI18n: FlatI18n;
    private flatInfo: FlatInfo;
    private APP_ID?: string;
    private ui = createUI();

    public readonly _app$: Val<FastboardApp | null>;
    public readonly _el$: Val<HTMLElement | null>;
    public readonly _roomPhase$: Val<RoomPhase>;

    public readonly $Val: Readonly<{
        phase$: ReadonlyVal<IServiceWhiteboardPhase>;
        isWritable$: Val<boolean>;
        allowDrawing$: Val<boolean>;
    }>;

    public get roomID(): string | null {
        return this._app$.value?.room.uuid ?? null;
    }

    public get phase(): IServiceWhiteboardPhase {
        return this.$Val.phase$.value;
    }

    public get isWritable(): boolean {
        return this.$Val.isWritable$.value;
    }

    public setIsWritable(isWritable: boolean): void {
        this.$Val.isWritable$.setValue(isWritable);
    }

    public get allowDrawing(): boolean {
        return this.$Val.allowDrawing$.value;
    }

    public setAllowDrawing(allowDrawing: boolean): void {
        this.$Val.allowDrawing$.setValue(allowDrawing);
    }

    public constructor({ APP_ID, toaster, flatI18n, flatInfo = {} }: FastboardConfig) {
        super();

        this.APP_ID = APP_ID;
        this.toaster = toaster;
        this.flatI18n = flatI18n;
        this.flatInfo = flatInfo;

        this._app$ = new Val<FastboardApp | null>(null);
        this._el$ = new Val<HTMLElement | null>(null);
        this._roomPhase$ = new Val<RoomPhase>(RoomPhase.Disconnected);
        const isWritable$ = new Val(false);
        const allowDrawing$ = new Val(false);

        const phase$ = combine([this._app$, this._roomPhase$], ([app, phase]) =>
            app ? convertRoomPhase(phase) : IServiceWhiteboardPhase.Disconnected,
        );

        this.$Val = {
            phase$,
            isWritable$,
            allowDrawing$,
        };
        this.sideEffect.push(() => {
            this._app$.destroy();
            this._el$.destroy();
            this._roomPhase$.destroy();
            phase$.destroy();
            allowDrawing$.destroy();
        });

        this.setUA();

        this.sideEffect.push([
            combine([this._app$, allowDrawing$]).subscribe(([app, allowDrawing]) => {
                const room = app?.room;
                if (!room) {
                    return;
                }
                room.disableDeviceInputs = !allowDrawing;
                room.disableCameraTransform = !allowDrawing;
                app.manager.setReadonly(!allowDrawing);
            }),
            combine([this._app$, isWritable$]).subscribe(([app, isWritable]) => {
                const room = app?.room;
                if (!room) {
                    return;
                }
                if (isWritable !== room.isWritable) {
                    app.room.setWritable(isWritable).catch(e => {
                        if (process.env.NODE_ENV !== "production") {
                            console.error(e);
                        }
                    });
                }
            }),
            this._el$.subscribe(el => {
                if (el) {
                    this.ui.mount(el, {
                        app: this._app$.value,
                        config: {
                            // Hide zoom control
                            zoom_control: { enable: false },
                        },
                    });
                } else {
                    this.ui.destroy();
                }
            }),
            this._app$.subscribe(app => {
                this.ui.update({ app });
            }),
            this.flatI18n.$Val.language$.subscribe(language => {
                this.ui.update({ language });
            }),
        ]);
    }

    public async joinRoom({
        appID = this.APP_ID,
        roomID,
        roomToken,
        uid,
        nickName,
        region,
        options = {},
    }: IServiceWhiteboardJoinRoomConfig): Promise<void> {
        if (!appID) {
            throw new Error("[Fastboard] APP_ID is not set");
        }

        if (this.roomID) {
            throw new Error(
                `[Fastboard] cannot join room '${roomID}', already joined '${this.roomID}'`,
            );
        }

        this._roomPhase$.setValue(RoomPhase.Disconnected);

        const fastboardAPP = await createFastboard({
            sdkConfig: {
                appIdentifier: appID,
                region,
                deviceType: DeviceType.Surface,
                pptParams: {
                    useServerWrap: true,
                },
                disableNewPencilStroke: options.strokeTail === false,
            },
            managerConfig: {
                containerSizeRatio: options.ratio ?? 9 / 16,
                cursor: true,
                collectorStyles: {
                    position: "absolute",
                    bottom: "8px",
                },
                viewMode: "scroll",
            },
            joinRoom: {
                uuid: roomID,
                roomToken,
                region,
                userPayload: {
                    uid,
                    nickName,
                    // avatar: "url/to/avatar.png",
                },
                isWritable: this.isWritable,
                uid,
                floatBar: true,
                disableEraseImage: true,
                hotKeys: {
                    ...DefaultHotKeys,
                    changeToSelector: "s",
                    changeToLaserPointer: "z",
                    changeToPencil: "p",
                    changeToRectangle: "r",
                    changeToEllipse: "c",
                    changeToPencilEraser: "e",
                    changeToEraser: { key: "E", shiftKey: true, altKey: false, ctrlKey: false },
                    changeToText: "t",
                    changeToStraight: "l",
                    changeToArrow: "a",
                    changeToHand: "h",
                    // disable builtin copy-paste hotkeys, they are used to paste images from user clipboard
                    copy: undefined,
                    paste: undefined,
                },
                invisiblePlugins: [WindowManager],
                callbacks: {
                    onEnableWriteNowChanged: async () => {
                        const room = this._app$.value?.room;
                        if (!room) {
                            return;
                        }
                        if (room.isWritable && room.phase === RoomPhase.Connected) {
                            room.disableSerialization = false;
                        } else if (
                            this.allowDrawing &&
                            (room.phase === RoomPhase.Connected ||
                                room.phase === RoomPhase.Reconnecting)
                        ) {
                            room.setWritable(true);
                        }
                    },
                    onPhaseChanged: phase => {
                        this._roomPhase$.setValue(phase);
                    },
                    onRoomStateChanged: state => {
                        if (state.roomMembers) {
                            const members: string[] = [];
                            for (const member of state.roomMembers) {
                                const uid = member.payload?.uid;
                                if (uid) {
                                    members.push(uid);
                                }
                            }
                            this.events.emit("members", members);
                        }
                    },
                    onDisconnectWithError: error => {
                        this.toaster.emit("error", this.flatI18n.t("on-disconnect-with-error"));
                        console.error(error);
                    },
                    onKickedWithReason: async reason => {
                        this.events.emit(
                            "kicked",
                            reason === "kickByAdmin"
                                ? "kickedByAdmin"
                                : reason === "roomDelete"
                                  ? "roomDeleted"
                                  : reason === "roomBan"
                                    ? "roomBanned"
                                    : "unknown",
                        );
                        await this.leaveRoom();
                    },
                },
            },
        });

        this._app$.setValue(fastboardAPP);

        this.sideEffect.push(registerColorShortcut(fastboardAPP), "color-shortcut");
        this.sideEffect.push(injectCursor(fastboardAPP), "cursor");

        this.sideEffect.push(
            addManagerListener(
                fastboardAPP.manager,
                "scrollStateChange",
                ({ page, maxScrollPage }) => {
                    this.events.emit("scrollPage", page);
                    this.events.emit("maxScrollPage", maxScrollPage);
                },
            ),
            "scroll-state",
        );

        if (fastboardAPP.manager.scrollState) {
            const { page, maxScrollPage } = fastboardAPP.manager.scrollState;
            this.events.emit("scrollPage", page);
            this.events.emit("maxScrollPage", maxScrollPage);
        }

        this.sideEffect.push(
            addManagerListener(
                fastboardAPP.manager,
                "userScroll",
                this.events.emit.bind(this.events, "userScroll"),
            ),
        );

        // enable "text select text" on writable, once
        const disposeInitToolsId = "init-tools";
        this.sideEffect.push(
            fastboardAPP.writable.subscribe(writable => {
                if (writable) {
                    fastboardAPP.toggleTextCanSelectText(true);
                    this.sideEffect.flush(disposeInitToolsId);
                }
            }),
            disposeInitToolsId,
        );

        // restore and listen to appliance settings (i.e. memberState) on writable
        const disposeMemberStateId = "member-state";
        this.sideEffect.push(
            fastboardAPP.writable.subscribe(writable => {
                if (writable) {
                    initMemberState(fastboardAPP);
                    // 'subscribe' executes immediately, at which time the effect
                    // is not yet pushed into the side effect manager, so we need to
                    // wait for the next tick to dispose or replace it.
                    Promise.resolve().then(() => {
                        // using the same disposeId here, which means the old effect ('subscribe' above)
                        // will be disposed (removed) first, then the new effect ('subscribe' below) will take place.
                        this.sideEffect.push(
                            fastboardAPP.memberState.subscribe(saveMemberState),
                            disposeMemberStateId,
                        );
                    });
                }
            }),
            disposeMemberStateId,
        );

        // reset scroll position when page changed
        this.sideEffect.push(
            fastboardAPP.pageIndex.reaction(() => {
                if (fastboardAPP.writable.value) {
                    const scrollMode = fastboardAPP.manager.appManager?.scrollMode;
                    if (scrollMode) {
                        // 450 = 1600 (default page width) * 9/16 (default ratio) / 2 (center)
                        scrollMode.scrollStorage.setState({ scrollTop: 450 });
                        this.events.emit("userScroll");
                    }
                }
            }),
        );
    }

    public override has(uid: string): boolean {
        const app = this._app$.value;
        if (app) {
            return app.room.state.roomMembers.some(member => member.payload?.uid === uid);
        } else {
            return false;
        }
    }

    public async leaveRoom(): Promise<void> {
        const app = this._app$.value;
        if (app) {
            this._app$.setValue(null);
            this._el$.setValue(null);
            this.ui.destroy();
            await app.destroy().catch(console.error);
        }
    }

    public override render(el: HTMLElement): void {
        this._el$.setValue(el);
    }

    public override setTheme(theme: "light" | "dark"): void {
        this.ui.update({ theme });
    }

    public override async destroy(): Promise<void> {
        super.destroy();
        await this.leaveRoom();
    }

    public exportAnnotations(): Array<Promise<HTMLCanvasElement | null>> {
        const app = this._app$.value;
        if (!app) {
            return [];
        }

        const room = app.manager.mainView;
        const { contextPath, scenes } = app.manager.sceneState;
        const scale = app.manager.cameraState.scale;
        const actions: Array<() => Promise<void>> = Array(scenes.length);
        const canvases: Array<Promise<HTMLCanvasElement | null>> = Array(scenes.length);

        scenes.forEach((scene, i) => {
            canvases[i] = new Promise(resolve => {
                actions[i] = async () => {
                    try {
                        const scenePath = contextPath + scene.name;
                        const rect = room.getBoundingRect(scenePath);
                        const canvas = document.createElement("canvas");
                        canvas.width = rect.width * devicePixelRatio;
                        canvas.height = rect.height * devicePixelRatio;
                        const c = canvas.getContext("2d")!;
                        const camera: Camera = {
                            centerX: rect.originX + rect.width / 2,
                            centerY: rect.originY + rect.height / 2,
                            scale: scale,
                        };
                        room.screenshotToCanvas(
                            c,
                            scenePath,
                            rect.width,
                            rect.height,
                            camera,
                            devicePixelRatio,
                        );
                        resolve(canvas);
                    } catch (e) {
                        console.warn("Failed to snapshot scene", scene.name);
                        console.error(e);
                        resolve(null);
                    }
                };
            });
        });

        Promise.resolve().then(async () => {
            for (const act of actions) {
                await act();
            }
        });

        return canvases;
    }

    private setUA(): void {
        const exist = window.__netlessUA || "";
        if (!exist.includes("FLAT/")) {
            const ua =
                this.flatInfo.ua ||
                (this.flatI18n.t("app-name") || "").replace(/s+/g, "_").slice(0, 50);
            const platform = this.flatInfo.platform || "unknown";
            const region = this.flatInfo.region || "ROW";
            const version = this.flatInfo.version || "0.0.0";
            window.__netlessUA = exist + ` FLAT/${ua}_${platform}_${region}@${version} `;
        }
    }
}

function convertRoomPhase(roomPhase: RoomPhase): IServiceWhiteboardPhase {
    switch (roomPhase) {
        case RoomPhase.Connecting: {
            return IServiceWhiteboardPhase.Connecting;
        }
        case RoomPhase.Connected: {
            return IServiceWhiteboardPhase.Connected;
        }
        case RoomPhase.Reconnecting: {
            return IServiceWhiteboardPhase.Reconnecting;
        }
        case RoomPhase.Disconnecting: {
            return IServiceWhiteboardPhase.Disconnecting;
        }
        default: {
            return IServiceWhiteboardPhase.Disconnected;
        }
    }
}

const RememberStates: Array<keyof MemberState> = [
    "strokeColor",
    "strokeWidth",
    "textColor",
    "textSize",
    "pencilEraserSize",
];

function initMemberState(app: FastboardApp): void {
    const raw = localStorage.getItem("FastboardMemberState") || "{}";
    let memberState: Partial<MemberState> = {};
    try {
        memberState = JSON.parse(raw) || {};
    } catch {
        // ignore
    }
    // The text size is 16 by default, which is too small at the first sight, change it to 36.
    // Some users may still want to use 16, in that case we have no way to know the purpose.
    if (!memberState.textSize || memberState.textSize === 16) {
        memberState.textSize = 36;
    }
    // It is safe to call set state here since fastboard is writable now.
    app.room.setMemberState(memberState);
}

function saveMemberState(memberState: MemberState): void {
    const filtered: Record<string, any> = Object.create(null);
    for (const key of RememberStates) {
        filtered[key] = memberState[key];
    }
    localStorage.setItem("FastboardMemberState", JSON.stringify(filtered));
}

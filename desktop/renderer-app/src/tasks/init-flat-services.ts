import { AgoraRTCElectron } from "@netless/flat-service-provider-agora-rtc-electron";
import { FlatServiceProviderFile, FlatServices, Toaster, getFileExt } from "@netless/flat-services";
import { FlatI18n } from "@netless/flat-i18n";
import { FilePreviewPage } from "@netless/flat-pages/src/FilePreviewPage";

import monacoSVG from "@netless/flat-pages/src/assets/image/tool-monaco.svg";
import geogebraSVG from "@netless/flat-pages/src/assets/image/tool-geogebra.svg";
import countdownSVG from "@netless/flat-pages/src/assets/image/tool-countdown.svg";
import selectorSVG from "@netless/flat-pages/src/assets/image/tool-selector.svg";
import diceSVG from "@netless/flat-pages/src/assets/image/tool-dice.svg";
import mindmapSVG from "@netless/flat-pages/src/assets/image/tool-mindmap.svg";
import quillSVG from "@netless/flat-pages/src/assets/image/tool-quill.svg";
import saveSVG from "@netless/flat-pages/src/assets/image/tool-save.svg";
import presetsSVG from "@netless/flat-pages/src/assets/image/tool-presets.svg";

import { Remitter } from "remitter";
import { message } from "antd";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { combine } from "value-enhancer";

import { runtime } from "../utils/runtime";
import { portalWindowManager } from "../utils/portal-window-manager";
import { ipcAsyncByApp, ipcAsyncByPreviewFileWindow } from "../utils/ipc";
import { globalStore } from "@netless/flat-stores";
import { Region } from "@netless/flat-server-api";

export function initFlatServices(): void {
    const config = globalStore.serverRegionConfig;
    if (!config) {
        throw new Error("Missing server region config");
    }

    // @ts-expect-error "init-agora-electron-sdk" is not a user defined event,
    // it only aids to preload agora electron sdk
    ipcAsyncByApp("init-agora-electron-sdk", { AGORA_APP_ID: config.agora.appId });

    const toaster = createToaster();
    const flatI18n = FlatI18n.getInstance();
    const flatServices = FlatServices.getInstance();

    flatServices.register(
        "file",
        async () =>
            new FlatServiceProviderFile({
                flatServices,
                toaster,
                flatI18n,
                openPreviewWindow: async file => {
                    // @FIXME use simple window to preview file @BlackHole1
                    const containerEl = document.createElement("div");

                    try {
                        const instance = await portalWindowManager.createPreviewFilePortalWindow(
                            containerEl,
                            file.fileName,
                        );

                        ReactDOM.render(
                            // Wrap a RouterContext until @BlackHole1 finishes the refactoring
                            React.createElement(
                                BrowserRouter,
                                {},
                                React.createElement(FilePreviewPage, { file }),
                            ),
                            containerEl,
                        );

                        // when BrowserWindow close, will trigger onbeforeunload
                        // since the current function may be called in non-component code
                        // we need to manually call unmountComponentAtNode to unload the DOM
                        instance.onbeforeunload = () => {
                            ReactDOM.unmountComponentAtNode(containerEl);
                        };

                        const fileExt = getFileExt(file.fileURL).toLowerCase();

                        if (["png", "jpg", "jpeg"].includes(fileExt)) {
                            ipcAsyncByPreviewFileWindow(
                                "set-visual-zoom-level",
                                {
                                    minimumLevel: 1,
                                    maximumLevel: 3,
                                },
                                instance.browserWindowID,
                            );
                        }
                    } catch (e) {
                        console.error(e);
                    }
                },
            }),
    );

    flatServices.register("videoChat", async () => {
        const agoraRtcSDK$ = (window as any).agoraRtcSDK$;
        if (!agoraRtcSDK$) {
            throw new Error("Missing agora rtc electron sdk global");
        }

        return new Promise(resolve => {
            let instance: AgoraRTCElectron | undefined;
            agoraRtcSDK$.subscribe((rtcEngine: any) => {
                if (rtcEngine) {
                    if (instance) {
                        instance.setRTCEngine(rtcEngine);
                    } else {
                        instance = new AgoraRTCElectron({
                            APP_ID: config.agora.appId,
                            rtcEngine,
                            isMac: runtime.isMac,
                        });
                        resolve(instance);
                    }
                }
            });
        });
    });

    flatServices.register("textChat", async () => {
        const { AgoraRTM2 } = await import("@netless/flat-service-provider-agora-rtm2");
        return new AgoraRTM2(config.agora.appId);
    });

    flatServices.register("whiteboard", async () => {
        const { Fastboard, register, stockedApps } = await import(
            "@netless/flat-service-provider-fastboard"
        );
        void register({
            kind: "Monaco",
            appOptions: {
                loader: {
                    paths: {
                        vs: getVSPath(),
                    },
                },
            },
            src: () => import("@netless/app-monaco"),
        });
        void register({
            kind: "Countdown",
            src: () => import("@netless/app-countdown"),
        });
        void register({
            kind: "GeoGebra",
            src: () => import("@netless/app-geogebra"),
            appOptions: {
                // TODO: replace it with non-country specific url
                HTML5Codebase:
                    "https://flat-storage-cn-hz.whiteboard.agora.io/GeoGebra/HTML5/5.0/web3d",
            },
        });
        void register({
            kind: "Selector",
            src: () => import("@netless/app-selector"),
        });
        void register({
            kind: "Dice",
            src: () => import("@netless/app-dice"),
        });
        void register({
            kind: "MindMap",
            src: () => import("@netless/app-mindmap"),
        });
        void register({
            kind: "Quill",
            src: () => import("@netless/app-quill"),
        });
        void register({
            kind: "IframeBridge",
            src: () => import("@netless/app-iframe-bridge"),
        });

        const service = new Fastboard({
            APP_ID: config.whiteboard.appId,
            toaster,
            flatI18n,
            flatInfo: {
                platform: "electron",
                ua: process.env.FLAT_UA,
                region: process.env.FLAT_REGION,
                version: process.env.VERSION,
            },
        });

        service.sideEffect.addDisposer(
            combine([service._app$, flatI18n.$Val.language$]).subscribe(([_app, _lang]) => {
                stockedApps.clear();
                stockedApps.push(
                    {
                        kind: "Monaco",
                        icon: monacoSVG,
                        label: flatI18n.t("tool.monaco"),
                        onClick: app => app.manager.addApp({ kind: "Monaco" }),
                    },
                    {
                        kind: "GeoGebra",
                        icon: geogebraSVG,
                        label: flatI18n.t("tool.geogebra"),
                        onClick: app =>
                            app.manager.addApp({
                                kind: "GeoGebra",
                                attributes: { uid: app.room.uid },
                            }),
                    },
                    {
                        kind: "Countdown",
                        icon: countdownSVG,
                        label: flatI18n.t("tool.countdown"),
                        onClick: app => app.manager.addApp({ kind: "Countdown" }),
                    },
                    {
                        kind: "Selector",
                        icon: selectorSVG,
                        label: flatI18n.t("tool.selector"),
                        onClick: app => app.manager.addApp({ kind: "Selector" }),
                    },
                    {
                        kind: "Dice",
                        icon: diceSVG,
                        label: flatI18n.t("tool.dice"),
                        onClick: app => app.manager.addApp({ kind: "Dice" }),
                    },
                    {
                        kind: "MindMap",
                        icon: mindmapSVG,
                        label: flatI18n.t("tool.mindmap"),
                        onClick: app => {
                            // HACK: workaround app-monaco defines a `define` in global scope,
                            // and mindmap uses an AMD module that will break in this case.
                            (window as any).define = undefined;
                            app.manager.addApp({ kind: "MindMap", options: { title: "MindMap" } });
                        },
                    },
                    {
                        kind: "Quill",
                        icon: quillSVG,
                        label: flatI18n.t("tool.quill"),
                        onClick: app => app.manager.addApp({ kind: "Quill" }),
                    },
                    {
                        kind: "Save",
                        icon: saveSVG,
                        label: flatI18n.t("tool.save"),
                        onClick: () => {
                            service.events.emit("exportAnnotations");
                        },
                    },
                    {
                        kind: "Presets",
                        icon: presetsSVG,
                        label: flatI18n.t("tool.presets"),
                        onClick: () => {
                            service.events.emit("insertPresets");
                        },
                    },
                );
            }),
        );

        return service;
    });

    flatServices.register("recording", async () => {
        const { AgoraCloudRecording } = await import(
            "@netless/flat-service-provider-agora-cloud-recording"
        );
        return new AgoraCloudRecording();
    });

    flatServices.register(
        [
            "file-convert:doc",
            "file-convert:docx",
            "file-convert:ppt",
            "file-convert:pptx",
            "file-convert:pdf",
        ],
        async () => {
            const { FileConvertNetless } = await import(
                "@netless/flat-service-provider-file-convert-netless"
            );
            return new FileConvertNetless(config.whiteboard.convertRegion as Region);
        },
    );

    flatServices.register(
        [
            "file-insert:jpg",
            "file-insert:jpeg",
            "file-insert:png",
            "file-insert:webp",
            "file-insert:mp3",
            "file-insert:mp4",
            "file-insert:doc",
            "file-insert:docx",
            "file-insert:ppt",
            "file-insert:pptx",
            "file-insert:pdf",
        ],
        async () => {
            if (flatServices.isCreated("whiteboard")) {
                const { Fastboard, FastboardFileInsert } = await import(
                    "@netless/flat-service-provider-fastboard"
                );
                const service = await flatServices.requestService("whiteboard");
                if (service instanceof Fastboard) {
                    return new FastboardFileInsert(
                        service,
                        flatI18n,
                        toaster,
                        config.whiteboard.convertRegion as Region,
                    );
                }
            }
            return null;
        },
    );

    flatServices.register(
        ["file-preview:doc", "file-preview:docx", "file-preview:ppt", "file-preview:pdf"],
        async () => {
            const { FilePreviewNetless } = await import(
                "@netless/flat-service-provider-file-preview-netless"
            );
            return new FilePreviewNetless(config.whiteboard.convertRegion as Region);
        },
    );

    flatServices.register("file-preview:pptx", async () => {
        const { FilePreviewNetlessSlide } = await import(
            "@netless/flat-service-provider-file-preview-netless-slide"
        );
        return new FilePreviewNetlessSlide(config.whiteboard.convertRegion as Region);
    });
}

function createToaster(): Toaster {
    const toaster: Toaster = new Remitter();
    toaster.on("info", info => message.info(info));
    toaster.on("error", error => message.error(error));
    toaster.on("warn", warn => message.warn(warn));
    return toaster;
}

const getVSPath = (): string => {
    let vsPath;
    // /path/to/flat/node_modules/.pnpm/electron... -> /path/to/flat/node_modules/monaco-editor/min/vs
    // /path/to/flat/static -> /path/to/flat/static/monaco-editor/min/vs
    if (__dirname.includes("node_modules")) {
        const i = __dirname.indexOf("node_modules") + "node_modules".length;
        const base = __dirname.slice(0, i);
        vsPath = window.node.path.join(base, "monaco-editor", "min", "vs");
    } else {
        vsPath = window.node.path.join(__dirname, "monaco-editor", "min", "vs");
    }

    return `file:///${vsPath.replace(/\\/g, "/")}`;
};

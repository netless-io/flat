import AppSlide, { addHooks as addHooksSlide } from "@netless/app-slide";
import { register } from "@netless/fastboard-react";

const registerApps = (): void => {
    void register({
        kind: "Monaco",
        appOptions: {
            loader: {
                paths: {
                    vs: "https://flat-storage.oss-cn-hangzhou.aliyuncs.com/flat-resources/library/monaco-editor@0.27.0/min/vs",
                },
            },
        },
        src: async () => {
            const app = await import("@netless/app-monaco");
            return app.default ?? app;
        },
    });
    void register({
        kind: "Countdown",
        src: async () => {
            const app = await import("@netless/app-countdown");
            return app.default ?? app;
        },
    });
    void register({
        kind: "GeoGebra",
        src: async () => {
            const app = await import("@netless/app-geogebra");
            return app.default ?? app;
        },
        appOptions: {
            // TODO: replace it with non-country specific url
            HTML5Codebase:
                "https://flat-storage-cn-hz.whiteboard.agora.io/GeoGebra/HTML5/5.0/web3d",
        },
    });
    void register({
        kind: "IframeBridge",
        src: async () => {
            const app = await import("@netless/app-iframe-bridge");
            return app.default ?? app;
        },
    });
    void register({
        kind: "Slide",
        appOptions: {
            debug: false,
        },
        addHooks: addHooksSlide,
        src: AppSlide,
    });
};

export const initRegisterApps = (): void => {
    registerApps();
};

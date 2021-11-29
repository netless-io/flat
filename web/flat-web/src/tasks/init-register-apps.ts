import { WindowManager } from "@netless/window-manager";
import { addHooks as addHooksSlide } from "@netless/app-slide";

const registerApps = (): void => {
    void WindowManager.register({
        kind: "Monaco",
        src: async () => {
            const app = await import("@netless/app-monaco");
            return app.default ?? app;
        },
    });
    void WindowManager.register({
        kind: "Countdown",
        src: async () => {
            const app = await import("@netless/app-countdown");
            return app.default ?? app;
        },
    });
    void WindowManager.register({
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
    void WindowManager.register({
        kind: "IframeBridge",
        src: async () => {
            const app = await import("@netless/app-iframe-bridge");
            return app.default ?? app;
        },
    });
    void WindowManager.register({
        kind: "Slide",
        appOptions: {
            debug: false,
        },
        addHooks: addHooksSlide,
        src: async () => {
            const app = await import("@netless/app-slide");
            return app.default ?? app;
        },
    });
};

export const initRegisterApps = (): void => {
    registerApps();
};

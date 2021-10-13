import { WindowManager } from "@netless/window-manager";

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
};

export const initRegisterApps = (): void => {
    registerApps();
};

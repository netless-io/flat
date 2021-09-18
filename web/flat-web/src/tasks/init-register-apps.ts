import { WindowManager } from "@netless/window-manager";

const registerApps = async (): Promise<void> => {
    await WindowManager.register({
        kind: "Monaco",
        src: async () => {
            const app = await import("@netless/app-monaco");
            return app.default ?? app;
        },
    });
};

export const initRegisterApps = async (): Promise<void> => {
    await registerApps();
};

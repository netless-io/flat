import { WindowManager } from "@netless/window-manager";
import path from "path";

const registerApps = (): void => {
    void WindowManager.register({
        kind: "Monaco",
        appOptions: {
            loader: {
                paths: {
                    vs: getVSPath(),
                },
            },
        },
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
    });
    void WindowManager.register({
        kind: "IframeBridge",
        src: async () => {
            const app = await import("@netless/app-iframe-bridge");
            return app.default ?? app;
        },
    });
};

export const initRegisterApps = (): void => {
    registerApps();
};

const getVSPath = (): string => {
    let vsPath;
    if (process.env.NODE_ENV === "production") {
        vsPath = path.join(__dirname, "static", "monaco-editor", "min", "vs");
    } else {
        const nodeModulesName = "node_modules";
        const nodeModulesEndIndexByPath =
            __dirname.indexOf(nodeModulesName) + nodeModulesName.length;

        const rootNodeModulesPath = __dirname.slice(0, nodeModulesEndIndexByPath);

        vsPath = path.join(rootNodeModulesPath, "monaco-editor", "min", "vs");
    }

    return `file:///${vsPath.replace(/\\/g, "/")}`;
};

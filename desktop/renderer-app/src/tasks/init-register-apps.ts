import { WindowManager } from "@netless/window-manager";
import path from "path";

const registerApps = async (): Promise<void> => {
    await WindowManager.register({
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
};

export const initRegisterApps = async (): Promise<void> => {
    await registerApps();
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

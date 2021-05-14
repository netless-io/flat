import { app } from "electron";
import { windowManager } from "../utils/WindowManager";

export default async () => {
    await new Promise(resolve => {
        app.on("ready", resolve);
    });

    app.allowRendererProcessReuse = false;

    if (process.env.NODE_ENV === "development") {
        const installExtension = require("electron-devtools-installer");
        // TODO: replace official package version
        // when writing this code, electron-devtools-installer has not released the latest version
        // Expected version, greater than: v3.1.1
        installExtension([installExtension.REACT_DEVELOPER_TOOLS], {
            loadExtensionOptions: {
                allowFileAccess: true,
            },
        }).catch((err: Error) => console.log("added extension failed", err));
    }

    windowManager.createMainWindow();
};

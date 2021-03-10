import { app } from "electron";
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { windowManager } from "../utils/WindowManager";
import runtime from "../utils/Runtime";

export default async () => {
    await new Promise(resolve => {
        app.on("ready", resolve);
    });

    app.allowRendererProcessReuse = false;

    if (runtime.isDevelopment) {
        // TODO: replace official package version
        // when writing this code, electron-devtools-installer has not released the latest version
        // Expected version, greater than: v3.1.1
        installExtension([REACT_DEVELOPER_TOOLS], {
            loadExtensionOptions: {
                allowFileAccess: true,
            },
        }).catch(err => console.log("added extension failed", err));
    }

    windowManager.createMainWindow();
};

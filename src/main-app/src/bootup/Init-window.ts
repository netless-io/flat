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
        installExtension([REACT_DEVELOPER_TOOLS]).catch(err =>
            console.log("added extension failed", err),
        );
    }

    windowManager.createMainWindow();
};

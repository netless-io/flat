import { ipcEmit } from "./IPCEmit";
import { CustomSingleWindow } from "./WindowManager";

export const windowHookClose = (customWindow: CustomSingleWindow) => {
    customWindow.window.on("close", e => {
        if (customWindow.options.disableClose) {
            e.preventDefault();
            ipcEmit(customWindow.options.name)("window-will-close", {});
        }
    });
};

export const windowReadyToShow = (customWindow: CustomSingleWindow) => {
    customWindow.window.on("ready-to-show", () => {
        customWindow.window.show();
    });
};

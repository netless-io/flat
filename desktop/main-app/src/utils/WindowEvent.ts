import { ipcEmit } from "./IPCEmit";
import { CustomSingleWindow } from "./WindowManager";
import { autoUpdater } from "electron-updater";

export const windowHookClose = (customWindow: CustomSingleWindow): void => {
    customWindow.window.on("close", e => {
        // see: https://github.com/electron/electron/issues/7792
        if (!autoUpdater.autoInstallOnAppQuit) {
            return;
        }

        if (customWindow.options.disableClose) {
            e.preventDefault();
            ipcEmit(customWindow.options.name)("window-will-close", {});
        }
    });
};

export const windowReadyToShow = (customWindow: CustomSingleWindow): void => {
    customWindow.window.on("ready-to-show", () => {
        customWindow.window.show();
    });
};

export const windowOpenDevTools = (customWindow: CustomSingleWindow): void => {
    customWindow.window.webContents.once("dom-ready", () => {
        // open devTools must be completed after dom ready
        // link: https://github.com/electron/electron/issues/12438
        if (customWindow.options.isOpenDevTools) {
            customWindow.window.webContents.once("devtools-opened", () => {
                customWindow.window.focus();
            });

            customWindow.window.webContents.openDevTools();
        }
    });
};

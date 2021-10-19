import { ipcEmit } from "./ipc-emit";
import { autoUpdater } from "electron-updater";
import { CustomWindow } from "../window-manager/abstract";

export const windowHookClose = (customWindow: CustomWindow): void => {
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

export const windowReadyToShow = (customWindow: CustomWindow): void => {
    customWindow.window.on("ready-to-show", () => {
        if (customWindow.options.isPortal) {
            // waiting dom load finish
            setTimeout(() => {
                if (!customWindow.window.isDestroyed()) {
                    customWindow.window.show();
                }
            }, 100);
        } else {
            customWindow.window.show();
        }
    });
};

export const windowOpenDevTools = (customWindow: CustomWindow): void => {
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

import { CustomSingleWindow } from "./WindowManager";
import { ipc } from "flat-types";
import { app, ipcMain, powerSaveBlocker } from "electron";
import runtime from "./Runtime";

const windowActionAsync = (customWindow: CustomSingleWindow): ipc.WindowActionAsync => {
    const { window, options } = customWindow;

    return {
        "set-win-size": args => {
            window.setSize(args.width, args.height);

            if (args.autoCenter) {
                window.center();
            }

            window.resizable = !!args.resizable;
            window.maximizable = !!args.maximizable;

            switch (typeof args.setMinimumSize) {
                case "undefined": {
                    window.setMinimumSize(1, 1);
                    break;
                }
                case "boolean": {
                    window.setMinimumSize(args.width, args.height);
                    break;
                }
                case "object": {
                    window.setMinimumSize(
                        args.setMinimumSize.minWidth,
                        args.setMinimumSize.minHeight,
                    );
                    break;
                }
                default: {
                    break;
                }
            }
        },
        "disable-window": args => {
            options.disableClose = args.disable;
        },
        "set-title": args => {
            window.setTitle(args.title);
        },
        "set-prevent-sleep": args =>
            (() => {
                let powerSaveBlockerId = 0;
                return () => {
                    if (args.enable) {
                        if (!powerSaveBlocker.isStarted(powerSaveBlockerId)) {
                            powerSaveBlockerId = powerSaveBlocker.start("prevent-display-sleep");
                        }
                    } else {
                        if (powerSaveBlocker.isStarted(powerSaveBlockerId)) {
                            powerSaveBlocker.stop(powerSaveBlockerId);
                        }
                    }
                };
            })(),
    };
};

export const appActionAsync: ipc.AppActionAsync = {
    "set-open-at-login": args => {
        app.setLoginItemSettings({
            openAtLogin: args.isOpenAtLogin,
            openAsHidden: false,
        });
    },
};

export const appActionSync: ipc.AppActionSync = {
    "get-runtime": () => {
        return runtime;
    },
    "get-open-at-login": () => {
        return app.getLoginItemSettings().openAtLogin;
    },
};

export const injectionWindowIPCAction = (customWindow: CustomSingleWindow) => {
    ipcMain.on(
        customWindow.options.name,
        (
            _event,
            args: {
                actions: keyof ipc.WindowActionAsync;
                args: any;
            },
        ) => {
            windowActionAsync(customWindow)[args.actions](args.args);
        },
    );
};

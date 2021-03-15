import { CustomSingleWindow } from "./WindowManager";
import { ipc } from "flat-types";
import { app, ipcMain, powerSaveBlocker } from "electron";
import runtime from "./Runtime";

const windowActionAsync = (customWindow: CustomSingleWindow): ipc.WindowActionAsync => {
    const { window, options } = customWindow;

    return {
        "set-win-size": args => {
            args = {
                autoCenter: false,
                ...args,
            };

            window.setSize(args.width, args.height);

            if (args.autoCenter) {
                window.center();
            }
        },
        "disable-window": args => {
            options.disableClose = args.disable;
        },
        "set-title": args => {
            window.setTitle(args.title);
        },
        "set-resizable": args => {
            window.resizable = args.resizable;

            if ("minWidth" in args) {
                window.setMinimumSize(args.minWidth, args.minHeight);
            }
        },
        "set-maximizable": args => {
            window.maximizable = args.maximizable;
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

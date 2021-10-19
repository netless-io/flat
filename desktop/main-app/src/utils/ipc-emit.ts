import { ipc } from "flat-types";
import { windowManager } from "../window-manager";
import runtime from "./runtime";
import { constants } from "flat-types";

const ipcEmitHandler = (windowName: constants.WindowsName): IPCEmit => {
    return (eventName, args): void => {
        const window = windowManager.window(windowName)?.window;

        if (window) {
            window.webContents.send(eventName, args);
        } else if (runtime.isDevelopment) {
            throw new Error("send ipc failed: window does not exist");
        }
    };
};

export const ipcEmitByMain = ipcEmitHandler(constants.WindowsName.Main);
export const ipcEmitByShareScreenTip = ipcEmitHandler(constants.WindowsName.ShareScreenTip);

export const ipcEmit = (windowName: constants.WindowsName): IPCEmit => {
    switch (windowName) {
        case constants.WindowsName.Main: {
            return ipcEmitByMain;
        }
        case constants.WindowsName.ShareScreenTip: {
            return ipcEmitByShareScreenTip;
        }
    }
};

type IPCEmit<T extends keyof ipc.EmitEvents = keyof ipc.EmitEvents> = (
    eventName: T,
    args: ipc.EmitEvents[T],
) => void;

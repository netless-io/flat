import { ipc } from "flat-types";
import { windowManager } from "./WindowManager";
import runtime from "./Runtime";
import { constants } from "flat-types";

const ipcEmitHandler = (windowName: constants.WindowsName): IPCEmit => {
    return (eventName, args): void => {
        const window = windowManager.getWindow(windowName)?.window;

        if (window) {
            window.webContents.send(eventName, args);
        } else if (runtime.isDevelopment) {
            throw new Error("send ipc failed: window does not exist");
        }
    };
};

export const ipcEmitByMain = ipcEmitHandler(constants.WindowsName.Main);
export const ipcEmitByClass = ipcEmitHandler(constants.WindowsName.Class);
export const ipcEmitByReplay = ipcEmitHandler(constants.WindowsName.Replay);

export const ipcEmit = (windowName: constants.WindowsName): IPCEmit => {
    switch (windowName) {
        case constants.WindowsName.Main: {
            return ipcEmitByMain;
        }
        case constants.WindowsName.Class: {
            return ipcEmitByClass;
        }
        case constants.WindowsName.Replay: {
            return ipcEmitByReplay;
        }
    }
};

type IPCEmit<T extends keyof ipc.EmitEvents = keyof ipc.EmitEvents> = (
    eventName: T,
    args: ipc.EmitEvents[T],
) => void;

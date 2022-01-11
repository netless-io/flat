import { ipc } from "flat-types";
import { windowManager } from "../window-manager";
import runtime from "./runtime";
import { constants } from "flat-types";
import { CustomWindow, IsMultiInstance } from "../window-manager/abstract";

const sendIPC = (customWindow: CustomWindow | null, eventName: string, args: any): void => {
    if (customWindow) {
        customWindow.window.webContents.send(eventName, args);
    } else if (runtime.isDevelopment) {
        throw new Error("send ipc failed: window does not exist");
    }
};

export const ipcEmitByMain: IPCEmit<constants.WindowsName.Main> = (eventName, args): void => {
    const win = windowManager.windowType(constants.WindowsName.Main).getWin();

    sendIPC(win, eventName, args);
};
export const ipcEmitByShareScreenTip: IPCEmit<constants.WindowsName.ShareScreenTip> = (
    eventName,
    args,
) => {
    const win = windowManager.windowType(constants.WindowsName.ShareScreenTip).getWin();

    sendIPC(win, eventName, args);
};

export const ipcEmit = <NAME extends constants.WindowsName>(windowName: NAME): IPCEmit<NAME> => {
    switch (windowName) {
        case constants.WindowsName.Main: {
            return ipcEmitByMain;
        }
        case constants.WindowsName.ShareScreenTip: {
            return ipcEmitByShareScreenTip;
        }
        default: {
            throw new Error(`not found window name: ${windowName}`);
        }
    }
};

type IPCEmit<NAME extends constants.WindowsName> = <T extends keyof ipc.EmitEvents>(
    eventName: T,
    args: IsMultiInstance<NAME> extends true
        ? { id: number } & ipc.EmitEvents[T]
        : ipc.EmitEvents[T],
) => void;

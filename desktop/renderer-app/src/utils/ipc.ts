import { ipc } from "flat-types";
import { ipcRenderer } from "electron";
import { constants } from "flat-types";

export const ipcAsyncByMainWindow = <
    T extends keyof ipc.WindowActionAsync,
    U extends Parameters<ipc.WindowActionAsync[T]>[0],
>(
    action: T,
    args: U,
): void => {
    ipcRenderer.send(constants.WindowsName.Main, {
        actions: action,
        args,
    });
};

export const ipcAsyncByShareScreenTipWindow = <
    T extends keyof ipc.WindowActionAsync,
    U extends Parameters<ipc.WindowActionAsync[T]>[0],
>(
    action: T,
    args: U,
): void => {
    ipcRenderer.send(constants.WindowsName.ShareScreenTip, {
        actions: action,
        args,
    });
};

export const ipcAsyncByApp = <
    T extends keyof ipc.AppActionAsync,
    U extends Parameters<ipc.AppActionAsync[T]>[0],
>(
    action: T,
    args?: U,
): void => {
    ipcRenderer.send(action, args);
};

export const ipcSyncByApp = <
    T extends keyof ipc.AppActionSync,
    U extends Parameters<ipc.AppActionSync[T]>[0],
>(
    action: T,
    args?: U,
): ReturnType<ipc.AppActionSync[T]> => {
    return ipcRenderer.invoke(action, args) as any;
};

export const ipcReceive = <T extends keyof ipc.EmitEvents, U extends ipc.EmitEvents[T]>(
    action: T,
    callback: (args: U) => void,
): void => {
    ipcRenderer.on(action, (_event, args) => {
        callback(args);
    });
};

export const ipcReceiveRemove = <T extends keyof ipc.EmitEvents>(action: T): void => {
    ipcRenderer.removeAllListeners(action);
};

import { ipc } from "flat-types";
import { ipcRenderer } from "electron";
import { constants } from "flat-types";

const ipcAsync = (windowName: constants.WindowsName) => {
    return <T extends keyof ipc.WindowActionAsync>(
        action: T,
        args: Parameters<ipc.WindowActionAsync[T]>[0],
    ): void => {
        ipcRenderer.send(windowName, {
            actions: action,
            args,
        });
    };
};

export const ipcAsyncByMainWindow = <
    T extends keyof ipc.WindowActionAsync,
    U extends Parameters<ipc.WindowActionAsync[T]>[0],
>(
    action: T,
    args: U,
): void => {
    ipcAsync(constants.WindowsName.Main)(action, args);
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

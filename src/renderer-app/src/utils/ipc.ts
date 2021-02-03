import { ipc } from "types-pkg";
import { ipcRenderer } from "electron";

export const ipcAsyncByMain = <T extends keyof ipc.ActionAsync>(
    action: T,
    args: Parameters<ipc.ActionAsync[T]>[0],
): void => {
    ipcRenderer.send("mainSource", {
        actions: action,
        args,
    });
};

export const ipcSyncByMain = <
    T extends keyof ipc.ActionSync,
    U extends Parameters<ipc.ActionSync[T]>[0]
>(
    action: T,
    args?: U,
): Promise<ReturnType<ipc.ActionSync[T]>> => {
    return ipcRenderer.invoke("mainSource", {
        actions: action,
        args,
    });
};

export const ipcReceiveByMain = <T extends keyof ipc.EmitEvents, U extends ipc.EmitEvents[T]>(
    action: T,
    callback: (args: U) => void,
): void => {
    ipcRenderer.on(action, (_event, args) => {
        callback(args);
    });
};

export const ipcReceiveRemoveByMain = <T extends keyof ipc.EmitEvents>(action: T): void => {
    ipcRenderer.removeAllListeners(action);
};

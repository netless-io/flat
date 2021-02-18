import { main } from "types-pkg";
import { ipcRenderer } from "electron";

export const ipcAsyncByMain = <T extends keyof main.ipc.ActionAsync>(
    action: T,
    args: Parameters<main.ipc.ActionAsync[T]>[0],
): void => {
    ipcRenderer.send("mainSource", {
        actions: action,
        args,
    });
};

export const ipcSyncByMain = <
    T extends keyof main.ipc.ActionSync,
    U extends Parameters<main.ipc.ActionSync[T]>[0]
>(
    action: T,
    args?: U,
): Promise<ReturnType<main.ipc.ActionSync[T]>> => {
    return ipcRenderer.invoke("mainSource", {
        actions: action,
        args,
    });
};

export const ipcReceiveByMain = <
    T extends keyof main.ipc.EmitEvents,
    U extends main.ipc.EmitEvents[T]
>(
    action: T,
    callback: (args: U) => void,
): void => {
    ipcRenderer.on(action, (_event, args) => {
        callback(args);
    });
};

export const ipcReceiveRemoveByMain = <T extends keyof main.ipc.EmitEvents>(action: T): void => {
    ipcRenderer.removeAllListeners(action);
};

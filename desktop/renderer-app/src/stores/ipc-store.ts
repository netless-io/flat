import { ipc } from "flat-types";
import { ipcRenderer } from "electron";
import { constants } from "flat-types";
import { makeAutoObservable } from "mobx";
import { routeConfig, RouteNameType } from "@netless/flat-pages/src/route-config";

export class IPCStore {
    public routePathName: RouteNameType | null = null;

    public constructor() {
        makeAutoObservable(this);
    }

    public configure = (routePathName?: string): void => {
        console.log("route path name", routePathName);
        switch (routePathName) {
            case routeConfig[RouteNameType.HomePage].path: {
                this.ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Main,
                });
                break;
            }
            default: {
                break;
            }
        }
    };

    public ipcAsyncByMainWindow = <
        T extends keyof ipc.WindowActionAsync,
        U extends Parameters<ipc.WindowActionAsync[T]>[0],
    >(
        action: T,
        args: U,
    ): void => {
        ipcRenderer.send(constants.WindowsName.Main, {
            actions: action,
            args,
            browserWindowID: NaN,
        });
    };

    public ipcAsyncByShareScreenTipWindow = <
        T extends keyof ipc.WindowActionAsync,
        U extends Parameters<ipc.WindowActionAsync[T]>[0],
    >(
        action: T,
        args: U,
    ): void => {
        ipcRenderer.send(constants.WindowsName.ShareScreenTip, {
            actions: action,
            args,
            browserWindowID: NaN,
        });
    };

    public ipcAsyncByPreviewFileWindow = <
        T extends keyof ipc.WindowActionAsync,
        U extends Parameters<ipc.WindowActionAsync[T]>[0],
    >(
        action: T,
        args: U,
        browserWindowID: string,
    ): void => {
        ipcRenderer.send(constants.WindowsName.PreviewFile, {
            actions: action,
            args,
            browserWindowID,
        });
    };

    public ipcAsyncByApp = <
        T extends keyof ipc.AppActionAsync,
        U extends Parameters<ipc.AppActionAsync[T]>[0],
    >(
        action: T,
        args?: U,
    ): void => {
        ipcRenderer.send(action, args);
    };

    public ipcSyncByApp = <
        T extends keyof ipc.AppActionSync,
        U extends Parameters<ipc.AppActionSync[T]>[0],
    >(
        action: T,
        args?: U,
    ): ReturnType<ipc.AppActionSync[T]> => {
        return ipcRenderer.invoke(action, args) as any;
    };

    public ipcReceive = <T extends keyof ipc.EmitEvents, U extends ipc.EmitEvents[T]>(
        action: T,
        callback: (args: U) => void,
    ): void => {
        ipcRenderer.on(action, (_event, args) => {
            callback(args as U);
        });
    };

    public ipcReceiveRemove = <T extends keyof ipc.EmitEvents>(action: T): void => {
        ipcRenderer.removeAllListeners(action);
    };
}

export const ipcStore = new IPCStore();

import { ipc } from "flat-types";
import { constants } from "flat-types";
import { makeAutoObservable } from "mobx";
import { AppUpgradeModalProps } from "../components/AppUpgradeModal";
import { differenceInHours } from "date-fns";
import { runtime } from "../utils/runtime";
import { matchPath } from "react-router-dom";
import { routeConfig, RouteConfig, RouteNameType } from "../route-config";

export class IPCStore {
    public routePathName: RouteNameType | null = null;
    public updateInfo: AppUpgradeModalProps["updateInfo"] | null = null;
    public checkNewVersionDate: number = new Date().getTime();

    public constructor() {
        makeAutoObservable(this);
    }

    public configure = (routePathName: string, lastLocation?: string): void => {
        switch (IPCStore.routeMatchPath(routePathName)) {
            case routeConfig[RouteNameType.HomePage].path: {
                const checkUpdateVisible =
                    differenceInHours(new Date().getTime(), this.checkNewVersionDate) >= 1;
                if (checkUpdateVisible) {
                    this.checkUpdateByFlat();
                    this.updateCheckNewVersionDate();
                }
                this.ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Main,
                    maximizable: true,
                    resizable: true,
                    setMinimumSize: true,
                    autoCenter: IPCStore.shouldWindowCenter(lastLocation),
                });
                break;
            }
            case routeConfig[RouteNameType.RoomDetailPage].path:
            case routeConfig[RouteNameType.PeriodicRoomDetailPage].path:
            case routeConfig[RouteNameType.ModifyOrdinaryRoomPage].path:
            case routeConfig[RouteNameType.ModifyPeriodicRoomPage].path:
            case routeConfig[RouteNameType.GeneralSettingPage].path:
            case routeConfig[RouteNameType.CameraCheckPage].path:
            case routeConfig[RouteNameType.MicrophoneCheckPage].path:
            case routeConfig[RouteNameType.HotKeySettingPage].path:
            case routeConfig[RouteNameType.AboutPage].path: {
                this.ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Main,
                    maximizable: true,
                    resizable: true,
                    setMinimumSize: true,
                });
                break;
            }
            case routeConfig[RouteNameType.BigClassPage].path:
            case routeConfig[RouteNameType.SmallClassPage].path:
            case routeConfig[RouteNameType.OneToOnePage].path:
            case routeConfig[RouteNameType.AIPage].path: {
                this.ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Class,
                    autoCenter: true,
                    resizable: true,
                    setMinimumSize: true,
                    maximizable: true,
                    trafficLightPosition: { x: 10, y: 25 },
                });

                this.ipcAsyncByMainWindow("intercept-native-window-close", {
                    intercept: true,
                });

                this.ipcAsyncByMainWindow("set-aspect-ratio", {
                    aspectRatio: 16 / 9,
                });
                break;
            }
            case routeConfig[RouteNameType.ReplayPage].path: {
                this.ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Replay,
                    autoCenter: true,
                    resizable: true,
                    setMinimumSize: true,
                    maximizable: true,
                });

                this.ipcAsyncByMainWindow("intercept-native-window-close", {
                    intercept: true,
                });

                this.ipcAsyncByMainWindow("set-aspect-ratio", {
                    aspectRatio: 16 / 9,
                });
                break;
            }
            case routeConfig[RouteNameType.LoginPage].path: {
                this.checkUpdateByFlat();
                this.ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Login,
                    autoCenter: true,
                });
                break;
            }
            case routeConfig[RouteNameType.SplashPage].path: {
                this.ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Splash,
                    autoCenter: true,
                });
                break;
            }
            default: {
                break;
            }
        }
    };

    public removeIPCEvent = (routePathName: string): void => {
        switch (IPCStore.routeMatchPath(routePathName)) {
            case routeConfig[RouteNameType.BigClassPage].path:
            case routeConfig[RouteNameType.SmallClassPage].path:
            case routeConfig[RouteNameType.OneToOnePage].path:
            case routeConfig[RouteNameType.AIPage].path:
            case routeConfig[RouteNameType.ReplayPage].path: {
                this.ipcAsyncByMainWindow("intercept-native-window-close", {
                    intercept: false,
                });
                break;
            }

            default: {
                break;
            }
        }
    };

    private static routeMatchPath = (routePathName: string): string | undefined => {
        for (const routeName in routeConfig) {
            const { path } = routeConfig[routeName as keyof RouteConfig];
            const result = matchPath(routePathName, {
                path,
                exact: true,
            });

            if (result?.path) {
                return result.path;
            }
        }

        return undefined;
    };

    private static shouldWindowCenter = (pathname?: string): boolean => {
        if (!pathname) {
            return false;
        }

        return [
            routeConfig.LoginPage,
            routeConfig.BigClassPage,
            routeConfig.OneToOnePage,
            routeConfig.AIPage,
            routeConfig.SmallClassPage,
        ].some(({ path }) => {
            return !!matchPath(pathname, {
                path,
                sensitive: true,
            });
        });
    };

    public updateCheckNewVersionDate = (): void => {
        this.checkNewVersionDate = new Date().getTime();
    };

    public setUpdateInfo = (info: AppUpgradeModalProps["updateInfo"]): void => {
        this.updateInfo = info;
    };

    public checkUpdateByFlat = (): void => {
        this.ipcSyncByApp("get-update-info")
            .then(data => {
                console.log("[Auto Updater]: Get Update Info");
                if (data.hasNewVersion) {
                    console.log(
                        `[Auto Updater]: Remote Version "${data.version}", Local Version "${runtime.appVersion}"`,
                    );
                    if (data.version !== runtime.appVersion) {
                        this.setUpdateInfo(data);
                    }
                }
            })
            .catch(err => {
                console.error("ipc failed", err);
            });
    };

    public ipcAsyncByMainWindow = <
        T extends keyof ipc.WindowActionAsync,
        U extends Parameters<ipc.WindowActionAsync[T]>[0],
    >(
        action: T,
        args: U,
    ): void => {
        window.electron.ipcRenderer.send(constants.WindowsName.Main, {
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
        window.electron.ipcRenderer.send(constants.WindowsName.ShareScreenTip, {
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
        window.electron.ipcRenderer.send(constants.WindowsName.PreviewFile, {
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
        window.electron.ipcRenderer.send(action, args);
    };

    public ipcSyncByApp = <
        T extends keyof ipc.AppActionSync,
        U extends Parameters<ipc.AppActionSync[T]>[0],
    >(
        action: T,
        args?: U,
    ): ReturnType<ipc.AppActionSync[T]> => {
        return window.electron.ipcRenderer.invoke(action, args) as any;
    };

    public ipcReceive = <T extends keyof ipc.EmitEvents, U extends ipc.EmitEvents[T]>(
        action: T,
        callback: (args: U) => void,
    ): void => {
        window.electron.ipcRenderer.on(action, (_event, args) => {
            callback(args as U);
        });
    };

    public ipcReceiveRemove = <T extends keyof ipc.EmitEvents>(action: T): void => {
        window.electron.ipcRenderer.removeAllListeners(action);
    };
}

export const ipcStore = new IPCStore();

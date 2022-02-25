import { BrowserWindowConstructorOptions } from "electron";
import { constants } from "flat-types";

export const defaultWindowOptions: Pick<WindowOptions, "disableClose" | "isOpenDevTools"> = {
    disableClose: false,
    isOpenDevTools: false,
};

export const defaultBrowserWindowOptions: BrowserWindowConstructorOptions = {
    resizable: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    autoHideMenuBar: true,
    webPreferences: {
        autoplayPolicy: "no-user-gesture-required",
        // TODO: set nodeIntegration: false
        //       This property is very unsafe and we should turn it off as soon as possible
        //       Need to predict if agora-electron-sdk is supported
        //       @BlackHole1
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
        webviewTag: true,
        nativeWindowOpen: true,
        backgroundThrottling: false,
        nodeIntegrationInSubFrames: false,
    },
};

export interface WindowOptions {
    url: string;
    name: constants.WindowsName;
    disableClose?: boolean;
    isOpenDevTools?: boolean;
    isPortal: boolean;
}

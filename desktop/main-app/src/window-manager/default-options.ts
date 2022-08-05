import { BrowserWindowConstructorOptions } from "electron";
import { constants } from "flat-types";
import runtime from "../utils/runtime";

export const defaultWindowOptions: Pick<WindowOptions, "interceptClose" | "isOpenDevTools"> = {
    interceptClose: false,
    isOpenDevTools: false,
};

export const defaultBrowserWindowOptions: BrowserWindowConstructorOptions = {
    resizable: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    autoHideMenuBar: true,
    // hidden title bar feature in low version of the Electron not work when the titleBarStyle attributes value is hidden,
    // but this bug was fixed in new version.
    // @TODO: remove frame options after upgrade new version of the Electron.
    frame: runtime.isMac,
    titleBarStyle: "hidden",
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
    interceptClose?: boolean;
    isOpenDevTools?: boolean;
    isPortal: boolean;
}

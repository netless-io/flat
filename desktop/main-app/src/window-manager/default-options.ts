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
    webPreferences: {
        autoplayPolicy: "no-user-gesture-required",
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
        webviewTag: true,
        nativeWindowOpen: true,
        backgroundThrottling: false,
        nodeIntegrationInSubFrames: true,
    },
};

export interface WindowOptions {
    url: string;
    name: constants.WindowsName;
    disableClose?: boolean;
    isOpenDevTools?: boolean;
    isPortal: boolean;
}

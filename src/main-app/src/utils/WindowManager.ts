import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { windowHookClose, windowReadyToShow } from "./WindowEvent";
import runtime from "./Runtime";
import { constants } from "types-pkg";

const defaultWindowOptions: Pick<WindowOptions, "disableClose" | "isOpenDevTools"> = {
    disableClose: false,
    isOpenDevTools: false,
};

const defaultBrowserWindowOptions: BrowserWindowConstructorOptions = {
    center: true,
    resizable: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    webPreferences: {
        autoplayPolicy: "no-user-gesture-required",
        nodeIntegration: true,
        contextIsolation: false,
        preload: runtime.preloadPath,
        webSecurity: false,
        webviewTag: true,
        nativeWindowOpen: true,
        backgroundThrottling: false,
        nodeIntegrationInSubFrames: true,
    },
};

export class WindowManager {
    private readonly wins: CustomWindows;

    public constructor() {
        this.wins = {};
    }

    private createWindow(
        windowOptions: WindowOptions,
        browserWindowOptions: BrowserWindowConstructorOptions,
    ) {
        const options = {
            ...defaultWindowOptions,
            ...windowOptions,
        };

        this.wins[options.name] = {
            options,
            window: new BrowserWindow({
                ...defaultBrowserWindowOptions,
                ...browserWindowOptions,
            }),
        };

        const innerWin = this.getWindow(options.name)!;

        void innerWin.window.loadURL(options.url);

        if (options.isOpenDevTools) {
            innerWin.window.webContents.openDevTools();
        }

        windowHookClose(innerWin);

        windowReadyToShow(innerWin);

        return innerWin;
    }

    public getWindow(name: constants.WindowsName): CustomSingleWindow | undefined {
        return this.wins[name];
    }

    public createMainWindow(): CustomSingleWindow {
        return this.createWindow(
            {
                url: runtime.startURL,
                name: constants.WindowsName.Main,
                isOpenDevTools: runtime.isDevelopment,
            },
            {
                width: 375,
                height: 668,
            },
        );
    }
}

export const windowManager = new WindowManager();

export type CustomSingleWindow = {
    window: BrowserWindow;
    options: WindowOptions;
};

type CustomWindows = {
    [k in constants.WindowsName]?: CustomSingleWindow;
};

interface WindowOptions {
    url: string;
    name: constants.WindowsName;
    disableClose?: boolean;
    isOpenDevTools?: boolean;
}

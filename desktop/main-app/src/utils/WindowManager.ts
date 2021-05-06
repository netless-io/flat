import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain, IpcMainEvent } from "electron";
import { windowHookClose, windowOpenDevTools, windowReadyToShow } from "./WindowEvent";
import runtime from "./Runtime";
import { constants } from "flat-types";
import { Subject, zip } from "rxjs";
import { ignoreElements, mergeMap } from "rxjs/operators";

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

        windowOpenDevTools(innerWin);

        windowHookClose(innerWin);

        windowReadyToShow(innerWin);

        if (runtime.isWin) {
            innerWin.window.setAutoHideMenuBar(true);
            innerWin.window.setMenuBarVisibility(false);
        }

        return innerWin;
    }

    public getWindow(name: constants.WindowsName): CustomSingleWindow | undefined {
        return this.wins[name];
    }

    public getMainWindow(): CustomSingleWindow | undefined {
        return this.wins[constants.WindowsName.Main];
    }

    public createMainWindow(): CustomSingleWindow {
        const win = this.createWindow(
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

        const domReady = new Subject<string>();
        const preloadLoad = new Subject<IpcMainEvent>();

        win.window.webContents.on("dom-ready", () => {
            domReady.next("");
        });

        ipcMain.on("preload-load", event => {
            preloadLoad.next(event);
        });

        // use the zip operator to solve the problem of not sending xx event after refreshing the page
        // don’t worry about sending multiple times, because once is used in preload.ts
        // link: https://www.learnrxjs.io/learn-rxjs/operators/combination/zip
        zip(domReady, preloadLoad)
            .pipe(
                mergeMap(([, event]) => {
                    event.sender.send("inject-agora-electron-sdk-addon");
                    return [];
                }),
                ignoreElements(),
            )
            .subscribe();

        return win;
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

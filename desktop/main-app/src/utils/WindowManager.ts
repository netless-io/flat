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

class RxSubject {
    public constructor(
        public readonly mainWindowCreated = new Subject(),
        public readonly domReady = new Subject<string>(),
        public readonly preloadLoad = new Subject<IpcMainEvent>(),
    ) {}
}

export class WindowManager extends RxSubject {
    public constructor(private readonly wins: CustomWindows = {}) {
        super();
    }

    private createWindow(
        windowOptions: WindowOptions,
        browserWindowOptions: BrowserWindowConstructorOptions,
    ) {
        const options = {
            ...defaultWindowOptions,
            ...windowOptions,
        };

        const window = new BrowserWindow({
            ...defaultBrowserWindowOptions,
            ...browserWindowOptions,
        });

        this.wins[options.name] = {
            options,
            window,
            didFinishLoad: window.loadURL(options.url),
        };

        const innerWin = this.getWindow(options.name)!;

        windowOpenDevTools(innerWin);

        windowHookClose(innerWin);

        windowReadyToShow(innerWin);

        if (runtime.isWin) {
            innerWin.window.setAutoHideMenuBar(true);
            innerWin.window.setMenuBarVisibility(false);
        }

        return innerWin;
    }

    public getWindow<W extends true>(
        name: constants.WindowsName,
        waiting: W,
    ): Promise<CustomSingleWindow>;
    public getWindow(name: constants.WindowsName, waiting?: false): CustomSingleWindow | undefined;
    public getWindow(
        name: constants.WindowsName,
        waiting?: boolean,
    ): Promise<CustomSingleWindow> | (CustomSingleWindow | undefined) {
        if (waiting) {
            return this.mainWindowCreated.toPromise().then(() => {
                return this.wins[name]!;
            });
        } else {
            return this.wins[name];
        }
    }

    public createMainWindow(): CustomSingleWindow {
        const win = this.createWindow(
            {
                url: runtime.startURL,
                name: constants.WindowsName.Main,
                isOpenDevTools: runtime.isDevelopment,
            },
            {
                width: 960,
                height: 640,
            },
        );

        this.mainWindowCreated.complete();

        win.window.webContents.on("dom-ready", () => {
            this.domReady.next("");
        });

        ipcMain.on("preload-load", event => {
            this.preloadLoad.next(event);
        });

        // use the zip operator to solve the problem of not sending xx event after refreshing the page
        // don’t worry about sending multiple times, because once is used in preload.ts
        // link: https://www.learnrxjs.io/learn-rxjs/operators/combination/zip
        zip(this.domReady, this.preloadLoad)
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
    didFinishLoad: Promise<void>;
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

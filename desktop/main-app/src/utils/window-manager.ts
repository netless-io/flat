import {
    BrowserWindow,
    screen,
    BrowserWindowConstructorOptions,
    ipcMain,
    IpcMainEvent,
    Display,
} from "electron";
import { windowHookClose, windowOpenDevTools, windowReadyToShow } from "./window-event";
import runtime from "./Runtime";
import { constants, portal } from "flat-types";
import { Subject, zip } from "rxjs";
import { ignoreElements, mergeMap } from "rxjs/operators";

const defaultWindowOptions: Pick<WindowOptions, "disableClose" | "isOpenDevTools"> = {
    disableClose: false,
    isOpenDevTools: false,
};

const defaultBrowserWindowOptions: BrowserWindowConstructorOptions = {
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
    ): CustomSingleWindow {
        const options = {
            ...defaultWindowOptions,
            ...windowOptions,
        };

        const window = new BrowserWindow({
            ...defaultBrowserWindowOptions,
            ...browserWindowOptions,
            webPreferences: {
                ...defaultBrowserWindowOptions.webPreferences,
                ...browserWindowOptions.webPreferences,
            },
        });

        this.wins[options.name] = {
            options,
            window,
            didFinishLoad: options.isPortal ? Promise.resolve() : window.loadURL(options.url),
        };

        const innerWin = this.getWindow(options.name)!;

        this.interceptPortalNewWindow(innerWin);

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

    public removeWindow(name: constants.WindowsName): void {
        const innerWin = this.wins[name];

        if (!innerWin) {
            return;
        }

        if (innerWin.window.isDestroyed()) {
            delete this.wins[name];

            return;
        }

        innerWin.options.disableClose = false;
        innerWin.window.close();
    }

    public createMainWindow(): CustomSingleWindow {
        const win = this.createWindow(
            {
                url: runtime.startURL,
                name: constants.WindowsName.Main,
                isOpenDevTools: runtime.isDevelopment,
                isPortal: false,
            },
            {
                center: true,
                ...constants.PageSize.Main,
                webPreferences: {
                    preload: runtime.preloadPath,
                },
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

    public createShareScreenTipWindow(
        options: BrowserWindowConstructorOptions,
    ): CustomSingleWindow {
        const display = this.getDisplayByMainWindow();

        const win = this.createWindow(
            {
                url: "",
                name: constants.WindowsName.ShareScreenTip,
                isOpenDevTools: false,
                isPortal: true,
                disableClose: true,
            },
            {
                x: WindowManager.getXCenterPoint(display, constants.PageSize.ShareScreenTip.width),
                y: display.workArea.y + 32,
                // this may be a bug in electron
                // when remove options.webContents will crash
                // @ts-ignore
                webContents: options.webContents,
                ...constants.PageSize.ShareScreenTip,
                frame: false,
            },
        );

        // default level is: floating, at this level, other applications can still override this window
        // so, we used modal-panel level
        win.window.setAlwaysOnTop(true, "modal-panel");

        return win;
    }

    private interceptPortalNewWindow(customWindow: CustomSingleWindow): void {
        customWindow.window.webContents.on(
            "new-window",
            (event, _url, frameName, _disposition, options) => {
                if (!frameName.startsWith(constants.Portal)) {
                    return;
                }

                const customOptions: portal.Options = JSON.parse(
                    frameName.substring(constants.Portal.length),
                );

                const handler = this.createPortalNewWindow(customOptions.name, options);

                if (handler === null) {
                    return;
                }

                event.preventDefault();

                event.newGuest = handler().window;
            },
        );
    }

    private createPortalNewWindow(
        windowName: constants.WindowsName,
        options: BrowserWindowConstructorOptions,
    ): null | (() => CustomSingleWindow) {
        switch (windowName) {
            case constants.WindowsName.ShareScreenTip: {
                return () => this.createShareScreenTipWindow(options);
            }
            default: {
                return null;
            }
        }
    }

    private getDisplayByMainWindow(): Display {
        const mainBounds = this.wins.Main!.window.getBounds();

        return screen.getDisplayNearestPoint({
            x: mainBounds.x,
            y: mainBounds.y,
        });
    }

    private static getXCenterPoint(display: Display, windowWidth: number): number {
        const { x, width } = display.workArea;

        // see: https://github.com/jenslind/electron-positioner/blob/85bb453453af050dda2479c88c4a24a262f8a2fb/index.js#L74
        return Math.floor(x + (width / 2 - windowWidth / 2));
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
    isPortal: boolean;
}

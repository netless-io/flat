import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { windowHookClose, windowReadyToShow } from "./WindowEvent";
import runtime from "./Runtime";
import { constants, portal } from "types-pkg";

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

        this.interceptPortalNewWindow(innerWin);

        if ("url" in options) {
            void innerWin.window.loadURL(options.url);
            windowReadyToShow(innerWin);
        }

        if (options.isOpenDevTools) {
            innerWin.window.webContents.openDevTools();
        }

        windowHookClose(innerWin);

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

    private interceptPortalNewWindow(customWindow: CustomSingleWindow): void {
        customWindow.window.webContents.on(
            "new-window",
            (event, _url, frameName, _disposition, options) => {
                if (!frameName.startsWith(constants.Portal)) {
                    return;
                }

                event.preventDefault();

                const customOptions: portal.Options = JSON.parse(
                    frameName.substring(constants.Portal.length),
                );

                const { name, title, width, height, disableClose, isChildWindow } = customOptions;

                const win = this.createWindow(
                    {
                        name,
                        isOpenDevTools: false,
                        isPortal: true,
                        disableClose: !!disableClose,
                    },
                    {
                        ...options,
                        show: true,
                        // the child window will always be in front of the parent window
                        parent: isChildWindow ? customWindow.window : undefined,
                        title: title,
                        width: width,
                        height: height,
                    },
                );

                // This must be called explicitly. Otherwise the window will not be centered
                win.window.center();

                // @ts-ignore
                event.newGuest = win.window;
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

type WindowOptions = {
    name: constants.WindowsName;
    disableClose?: boolean;
    isOpenDevTools?: boolean;
} & (
    | {
          url: string;
      }
    | {
          isPortal: true;
      }
);

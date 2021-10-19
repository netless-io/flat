import { constants } from "flat-types";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { windowHookClose, windowOpenDevTools, windowReadyToShow } from "../utils/window-event";
import {
    defaultBrowserWindowOptions,
    defaultWindowOptions,
    WindowOptions,
} from "./default-options";

export abstract class AbstractWindow {
    public win: CustomWindow | null = null;

    public abstract readonly name: constants.WindowsName;
    public abstract create(option: BrowserWindowConstructorOptions): CustomWindow;

    public remove(): void {
        if (!this.win) {
            return;
        }

        if (this.win.window.isDestroyed()) {
            this.win = null;

            return;
        }

        this.win.options.disableClose = false;
        this.win.window.close();
    }

    protected createWindow(
        windowOptions: WindowOptions,
        browserWindowOptions: BrowserWindowConstructorOptions,
    ): CustomWindow {
        const window = new BrowserWindow({
            ...defaultBrowserWindowOptions,
            ...browserWindowOptions,
            webPreferences: {
                ...defaultBrowserWindowOptions.webPreferences,
                ...browserWindowOptions.webPreferences,
            },
        });

        const options = {
            ...defaultWindowOptions,
            ...windowOptions,
        };

        this.win = {
            options,
            window,
            didFinishLoad: options.isPortal ? Promise.resolve() : window.loadURL(options.url),
        };

        windowOpenDevTools(this.win);

        windowHookClose(this.win);

        windowReadyToShow(this.win);

        return this.win;
    }
}

export type CustomWindow = {
    window: BrowserWindow;
    options: WindowOptions;
    didFinishLoad: Promise<void>;
};

export type AbstractWindows = {
    [K in constants.WindowsName]: AbstractWindow;
};

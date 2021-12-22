import { constants } from "flat-types";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { windowHookClose, windowOpenDevTools, windowReadyToShow } from "../utils/window-event";
import {
    defaultBrowserWindowOptions,
    defaultWindowOptions,
    WindowOptions,
} from "./default-options";

export abstract class AbstractWindow<MULTI_INSTANCE extends boolean> {
    public wins: CustomWindow[] = [];

    public abstract readonly name: constants.WindowsName;
    public abstract create(option: BrowserWindowConstructorOptions): CustomWindow;

    protected constructor(public isMultiInstance: MULTI_INSTANCE) {}

    public remove(...ids: MULTI_INSTANCE extends true ? number[] : never[]): void {
        if (this.isEmpty()) {
            return;
        }

        if (!this.isMultiInstance) {
            AbstractWindow.closeWindow(this.wins[0]);

            this.wins = [];
        } else {
            if (ids.length === 0) {
                this.wins.forEach(AbstractWindow.closeWindow);
                this.wins = [];
            } else {
                this.wins = this.wins.filter(win => {
                    if ((ids as number[]).includes(win.window.id)) {
                        AbstractWindow.closeWindow(win);
                        return false;
                    }

                    return true;
                });
            }
        }
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

        const win = {
            options,
            window,
            didFinishLoad: options.isPortal ? Promise.resolve() : window.loadURL(options.url),
        };

        if (this.isMultiInstance) {
            this.wins.push(win);
        } else {
            this.wins[0] = win;
        }

        windowOpenDevTools(win);

        windowHookClose(win);

        windowReadyToShow(win);

        return win;
    }

    public getWin(...ids: MULTI_INSTANCE extends true ? [number] : never[]): CustomWindow | null;
    public getWin(...ids: any[]): CustomWindow | null {
        if (this.isEmpty()) {
            return null;
        }

        if (this.isMultiInstance) {
            const id = ids[0];
            for (const win of this.wins) {
                if (win.window.id === id) {
                    return win;
                }
            }
            return null;
        }

        return this.wins[0] || null;
    }

    public isEmpty(): boolean {
        return this.wins.length === 0;
    }

    private static closeWindow(win: CustomWindow): void {
        if (!win.window.isDestroyed()) {
            win.options.disableClose = false;
            win.window.close();
        }
    }
}

export type CustomWindow = {
    window: BrowserWindow;
    options: WindowOptions;
    didFinishLoad: Promise<void>;
};

export type AbstractWindows = {
    [constants.WindowsName.Main]: AbstractWindow<false>;
    [constants.WindowsName.ShareScreenTip]: AbstractWindow<false>;
};

// see: https://stackoverflow.com/questions/67114094/typescript-get-type-of-generic-class-parameter
type GetClassParameterForAbstractWindow<T extends AbstractWindow<any>> = T extends AbstractWindow<
    infer R
>
    ? R
    : unknown;

export type IsMultiInstance<NAME extends constants.WindowsName> =
    GetClassParameterForAbstractWindow<AbstractWindows[NAME]>;

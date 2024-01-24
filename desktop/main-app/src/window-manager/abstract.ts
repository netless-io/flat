import { constants } from "flat-types";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import {
    windowHookClose,
    windowHookClosed,
    windowOpenDevTools,
    windowOpenExternalLink,
    windowReadyToShow,
} from "../utils/window-event";
import {
    defaultBrowserWindowOptions,
    defaultWindowOptions,
    WindowOptions,
} from "./default-options";

export abstract class AbstractWindow<MULTI_INSTANCE extends boolean> {
    public wins: CustomWindow[] = [];

    public abstract create(option: BrowserWindowConstructorOptions): CustomWindow;

    protected constructor(
        public readonly isMultiInstance: MULTI_INSTANCE,
        public readonly name: constants.WindowsName,
    ) {}

    public remove(id: number | CustomWindow): void {
        const win = typeof id === "number" ? this.getWin(id) : id;

        if (win === null) {
            return;
        }

        AbstractWindow.closeWindow(win);

        if (this.isMultiInstance) {
            this.wins = this.wins.filter(({ window }) => {
                if (window.isDestroyed()) {
                    return false;
                }

                return window.id !== id;
            });

            return;
        }

        this.wins = [];
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
        windowHookClosed(win, () => {
            // sync this.wins
            this.remove(win);
        });

        windowReadyToShow(win);
        windowOpenExternalLink(win);

        return win;
    }

    public getWin(...ids: MULTI_INSTANCE extends true ? [number] : number[]): CustomWindow | null;
    public getWin(...ids: any[]): CustomWindow | null {
        if (this.isEmpty()) {
            return null;
        }

        if (this.isMultiInstance) {
            const id = ids[0];
            for (const win of this.wins) {
                if (!win.window.isDestroyed() && win.window.id === id) {
                    return win;
                }
            }
            return null;
        }

        return this.wins[0].window.isDestroyed() ? null : this.wins[0];
    }

    public isEmpty(): boolean {
        return this.wins.length === 0;
    }

    private static closeWindow(win: CustomWindow): void {
        if (!win.window.isDestroyed()) {
            win.options.interceptClose = false;
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
    [constants.WindowsName.PreviewFile]: AbstractWindow<true>;
};

// see: https://stackoverflow.com/questions/67114094/typescript-get-type-of-generic-class-parameter
type GetClassParameterForAbstractWindow<T extends AbstractWindow<any>> =
    T extends AbstractWindow<infer R> ? R : unknown;

export type IsMultiInstance<NAME extends constants.WindowsName> =
    GetClassParameterForAbstractWindow<AbstractWindows[NAME]>;

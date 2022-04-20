import { constants } from "flat-types";
import { AbstractWindow, CustomWindow } from "../abstract";
import runtime from "../../utils/runtime";
import { Val, combine } from "value-enhancer";
import { ipcMain, IpcMainEvent } from "electron";

export class WindowMain extends AbstractWindow<false> {
    private readonly _mainWindowCreated$ = new Val(false);

    public constructor() {
        super(false, constants.WindowsName.Main);
    }

    public create(): CustomWindow {
        const customWindow = this.createWindow(
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

        this._mainWindowCreated$.setValue(true);

        this.setupDOMReady(customWindow);

        if (process.env.NODE_ENV === "development") {
            WindowMain.loadExtensions(customWindow, "react-devtools");
        }

        return customWindow;
    }

    public async assertWindow(): Promise<CustomWindow> {
        if (this._mainWindowCreated$.value) {
            return this.wins[0];
        }
        return new Promise(resolve => {
            const onMainWindowCreated = (created: boolean): void => {
                if (created) {
                    resolve(this.wins[0]);
                    this._mainWindowCreated$.unsubscribe(onMainWindowCreated);
                }
            };
            this._mainWindowCreated$.subscribe(onMainWindowCreated);
        });
    }

    private static loadExtensions(win: CustomWindow, extensionName: "react-devtools"): void {
        const { REACT_DEVELOPER_TOOLS } = require("electron-devtools-vendor");

        win.window.webContents.session
            .loadExtension(REACT_DEVELOPER_TOOLS as string, {
                allowFileAccess: true,
            })
            .catch(error => {
                console.error(
                    `install ${extensionName} extensions failed! error message: ${error.message}. error stack: ${error.stack}`,
                );
            });
    }

    private setupDOMReady(win: CustomWindow): void {
        const domReady$ = new Val(false);
        const preloaded$ = new Val<IpcMainEvent | null>(null);

        win.window.webContents.once("dom-ready", () => {
            domReady$.setValue(true);
        });

        const onPreloadLoad = (event: IpcMainEvent): void => {
            // preload-load is global event, any window create will trigger,
            // but we only need Main window event
            if (event.sender.id === win.window.webContents.id) {
                preloaded$.setValue(event);
                ipcMain.off("preload-load", onPreloadLoad);
            }
        };

        ipcMain.on("preload-load", onPreloadLoad);

        const disposer = combine([domReady$, preloaded$]).subscribe(([domReady, event]) => {
            if (domReady && event) {
                if (!event.sender.isDestroyed()) {
                    event.sender.send("preload-dom-ready");
                    disposer();
                }
            }
        });
    }
}

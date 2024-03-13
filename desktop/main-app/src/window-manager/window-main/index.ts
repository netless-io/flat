import { constants } from "flat-types";
import { AbstractWindow, CustomWindow } from "../abstract";
import runtime from "../../utils/runtime";
import { Val, combine } from "value-enhancer";
import { ipcMain, IpcMainEvent } from "electron";

export class WindowMain extends AbstractWindow<false> {
    private readonly _mainWindow$ = new Val<CustomWindow | null>(null);

    public constructor() {
        super(false, constants.WindowsName.Main);
    }

    public create(): CustomWindow {
        this.setupDOMReady();

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

        this._mainWindow$.setValue(customWindow);

        // if (process.env.NODE_ENV === "development") {
        //     WindowMain.loadExtensions(customWindow, "react-devtools");
        // }

        return customWindow;
    }

    public async assertWindow(): Promise<CustomWindow> {
        return (
            this._mainWindow$.value ??
            new Promise<CustomWindow>(resolve => {
                const disposer = this._mainWindow$.subscribe(win => {
                    if (win) {
                        resolve(win);
                        disposer();
                    }
                });
            })
        );
    }

    // @ts-ignore Don't load react extension which is annoying in debugging
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

    private setupDOMReady(): void {
        const domReady$ = new Val<{ AGORA_APP_ID: string } | null>(null);
        const preloaded$ = new Val<IpcMainEvent | null>(null);

        combine([domReady$, preloaded$]).subscribe(([domReady, event]) => {
            if (domReady && event) {
                if (!event.sender.isDestroyed()) {
                    event.sender.send("preload-dom-ready", domReady);
                }
            }
        });

        ipcMain.on("init-agora-electron-sdk", (_event, args: { AGORA_APP_ID: string }) => {
            domReady$.setValue(args);
        });

        ipcMain.on("preload-loaded", (event: IpcMainEvent): void => {
            const win = this._mainWindow$.value;
            // preload-load is global event, any window create will trigger,
            // but we only need Main window event
            if (win && event.sender.id === win.window.webContents.id) {
                preloaded$.setValue(event);
            }
        });
    }
}

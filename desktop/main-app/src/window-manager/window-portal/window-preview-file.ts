import { AbstractWindow, CustomWindow } from "../abstract";
import { constants } from "flat-types";

export class WindowPreviewFile extends AbstractWindow<true> {
    public constructor() {
        super(true, constants.WindowsName.PreviewFile);
    }

    public create(options: Electron.BrowserWindowConstructorOptions): CustomWindow {
        return this.createWindow(
            {
                url: "",
                name: constants.WindowsName.PreviewFile,
                isOpenDevTools: false,
                isPortal: true,
            },
            {
                ...constants.PageSize.PreviewFile,
                maximizable: true,
                fullscreenable: true,
                resizable: true,
                // @ts-ignore
                webContents: options.webContents,
                // Multi-Window feature methods is too hack that not support communication events between Renderer and Main
                // so that using default title bar style in here.
                frame: true,
                titleBarStyle: "default",
            },
        );
    }
}

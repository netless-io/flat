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
                // current electron version not support the frameless
                frame: true,
                titleBarStyle: "default",
            },
        );
    }
}

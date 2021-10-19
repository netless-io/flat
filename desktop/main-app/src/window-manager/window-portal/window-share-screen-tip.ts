import { AbstractWindow, CustomWindow } from "../abstract";
import { constants } from "flat-types";
import { getDisplayByMainWindow, getXCenterPoint } from "./utils";

export class WindowShareScreenTip extends AbstractWindow {
    public readonly name = constants.WindowsName.ShareScreenTip;

    public create(options: Electron.BrowserWindowConstructorOptions): CustomWindow {
        const display = getDisplayByMainWindow();

        const win = this.createWindow(
            {
                url: "",
                name: constants.WindowsName.ShareScreenTip,
                isOpenDevTools: false,
                isPortal: true,
                disableClose: true,
            },
            {
                x: getXCenterPoint(display, constants.PageSize.ShareScreenTip.width),
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
}

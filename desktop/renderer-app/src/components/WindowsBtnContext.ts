import { WindowsBtnContextInterface } from "@netless/flat-pages/src/components/WindowsBtnContext";
import { WindowsSystemBtnItem } from "flat-components";
import {
    ipcAsyncByMainWindow,
    ipcAsyncByShareScreenTipWindow,
    ipcReceive,
    ipcReceiveRemove,
} from "../utils/ipc";
import { portalWindowManager } from "../utils/portal-window-manager";

export class WindowsBtnContext implements WindowsBtnContextInterface {
    public showWindowsBtn: boolean = window.node.os.platform() === "win32";

    public onClickWindowsSystemBtn = (winSystemBtn: WindowsSystemBtnItem): void => {
        ipcAsyncByMainWindow("set-win-status", { windowStatus: winSystemBtn });
    };

    public clickWindowMaximize = (): void => {
        ipcAsyncByMainWindow("set-win-status", { windowStatus: "maximize" });
    };

    public sendWindowWillCloseEvent = (callback: () => void): void => {
        ipcReceive("window-will-close", () => {
            callback();
        });
    };

    public removeWindowWillCloseEvent = (): void => {
        ipcReceiveRemove("window-will-close");
    };

    public openExternalBrowser = (url: string): void => {
        void window.electron.shell.openExternal(url);
    };

    public createShareScreenTipPortalWindow = (
        div: HTMLDivElement,
        title: string,
    ): (() => void) => {
        portalWindowManager.createShareScreenTipPortalWindow(div, title);
        return () => ipcAsyncByShareScreenTipWindow("force-close-window", {});
    };
}

export const windowsBtnContext = new WindowsBtnContext();

import { WindowsBtnContextInterface } from "@netless/flat-pages/src/components/WindowsBtnContext";
import { WindowsSystemBtnItem } from "flat-components";
import { ipcAsyncByMainWindow, ipcReceive, ipcReceiveRemove } from "../utils/ipc";

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
}

export const windowsBtnContext = new WindowsBtnContext();

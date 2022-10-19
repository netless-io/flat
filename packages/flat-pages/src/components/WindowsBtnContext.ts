import { WindowsSystemBtnItem } from "flat-components";

export interface WindowsBtnContextInterface {
    showWindowsBtn: boolean;
    onClickWindowsSystemBtn: (winSystemBtn: WindowsSystemBtnItem) => void;
    clickWindowMaximize: () => void;
    sendWindowWillCloseEvent: (callback: () => void) => void;
    removeWindowWillCloseEvent: () => void;
    openExternalBrowser: (url: string) => void;
    createShareScreenTipPortalWindow: (div: HTMLDivElement, title: string) => () => void;
}

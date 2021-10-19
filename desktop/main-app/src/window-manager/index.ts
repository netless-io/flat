import { WindowManager } from "./window-manager";
import { WindowMain } from "./window-main";
import { constants } from "flat-types";
import { WindowShareScreenTip } from "./window-portal/window-share-screen-tip";

export const windowManager = new WindowManager({
    [constants.WindowsName.Main]: new WindowMain(),
    [constants.WindowsName.ShareScreenTip]: new WindowShareScreenTip(),
});

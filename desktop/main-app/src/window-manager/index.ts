import { constants } from "flat-types";
import { WindowMain } from "./window-main";
import { WindowManager } from "./window-manager";
import { WindowPreviewFile } from "./window-portal/window-preview-file";
import { WindowShareScreenTip } from "./window-portal/window-share-screen-tip";

export const windowManager = new WindowManager({
    [constants.WindowsName.Main]: new WindowMain(),
    [constants.WindowsName.ShareScreenTip]: new WindowShareScreenTip(),
    [constants.WindowsName.PreviewFile]: new WindowPreviewFile(),
});

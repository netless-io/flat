import { WindowManager } from "./window-manager";
import { WindowMain } from "./window-main";
import { constants } from "flat-types";
import { WindowShareScreenTip } from "./window-portal/window-share-screen-tip";
import { WindowPreviewFile } from "./window-portal/window-preview-file";

export const windowManager = new WindowManager({
    [constants.WindowsName.Main]: new WindowMain(),
    [constants.WindowsName.ShareScreenTip]: new WindowShareScreenTip(),
    [constants.WindowsName.PreviewFile]: new WindowPreviewFile(),
});

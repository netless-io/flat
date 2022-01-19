import { app } from "electron";
import { constants } from "flat-types";
import { windowManager } from "../window-manager";

export default (): void => {
    app.allowRendererProcessReuse = false;

    windowManager.create(constants.WindowsName.Main);
};

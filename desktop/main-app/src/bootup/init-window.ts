import { app } from "electron";
import { windowManager } from "../window-manager";
import { constants } from "flat-types";

export default (): void => {
    app.allowRendererProcessReuse = false;

    windowManager.create(constants.WindowsName.Main);
};

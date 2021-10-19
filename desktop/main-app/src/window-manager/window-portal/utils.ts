import { Display, screen } from "electron";
import { windowManager } from "../index";
import { constants } from "flat-types";

export const getDisplayByMainWindow = (): Display => {
    const mainBounds = windowManager.window(constants.WindowsName.Main)!.window.getBounds();

    return screen.getDisplayNearestPoint({
        x: mainBounds.x,
        y: mainBounds.y,
    });
};

export const getXCenterPoint = (display: Display, windowWidth: number): number => {
    const { x, width } = display.workArea;

    // see: https://github.com/jenslind/electron-positioner/blob/85bb453453af050dda2479c88c4a24a262f8a2fb/index.js#L74
    return Math.floor(x + (width / 2 - windowWidth / 2));
};

import { app, Menu, MenuItemConstructorOptions } from "electron";
import runtime from "../utils/Runtime";

export default () => {
    if (runtime.isWin) {
        Menu.setApplicationMenu(Menu.buildFromTemplate([]));
        return;
    }

    const appByMacMenu: IMenu = {
        label: app.name,
        submenu: [
            {
                role: "about",
            },
            {
                role: "hide",
            },
            {
                role: "hideOthers",
            },
            {
                role: "quit",
            },
        ],
    };

    const menu = Menu.buildFromTemplate([appByMacMenu]);
    Menu.setApplicationMenu(menu);
};

type IMenu = {
    label: string;
    submenu: MenuItemConstructorOptions[];
};

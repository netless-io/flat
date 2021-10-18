import { app, Menu, MenuItemConstructorOptions } from "electron";
import runtime from "../utils/runtime";

export default (): void => {
    const appByMacMenu: IMenu = {
        label: app.name,
        submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
        ],
    };

    const fileMenu: IMenu = {
        label: "File",
        submenu: [{ role: "close" }],
    };
    if (runtime.isWin) {
        fileMenu.submenu = [{ role: "quit" }];
    }

    const editMenu: IMenu = {
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
        ],
    };
    if (runtime.isWin) {
        editMenu.submenu.push({ role: "delete" }, { type: "separator" }, { role: "selectAll" });
    } else {
        editMenu.submenu.push(
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
                label: "Speech",
                submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
        );
    }

    const windowMenu: IMenu = {
        label: "Window",
        submenu: [{ role: "minimize" }, { role: "zoom" }],
    };
    if (runtime.isWin) {
        windowMenu.submenu.push({ role: "close" });
    } else {
        windowMenu.submenu.push(
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" },
        );
    }

    const template: MenuItemConstructorOptions[] = [
        editMenu,
        fileMenu,
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { role: "toggleDevTools" },
                { type: "separator" },
                { role: "resetZoom" },
                { role: "zoomIn" },
                { role: "zoomOut" },
                { type: "separator" },
                { role: "togglefullscreen" },
            ],
        },
        windowMenu,
    ];

    if (runtime.isMac) {
        template.unshift(appByMacMenu);
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};

type IMenu = {
    label: string;
    submenu: MenuItemConstructorOptions[];
};

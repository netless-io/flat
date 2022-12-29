import { app, Menu, MenuItemConstructorOptions } from "electron";
import runtime from "../utils/runtime";

const i18n = {
    en: {
        about: `About ${app.name}`,
        services: "Services",
        hide: `Hide ${app.name}`,
        hideOthers: "Hide Others",
        unhide: "Show All",
        file: "File",
        quit: `Quit ${app.name}`,
        close: "Close",
        edit: "Edit",
        undo: "Undo",
        redo: "Redo",
        cut: "Cut",
        copy: "Copy",
        paste: "Paste",
        delete: "Delete",
        selectAll: "Select All",
        pasteAndMatchStyle: "Paste and Match Style",
        speech: "Speech",
        startSpeaking: "Start Speaking",
        stopSpeaking: "Stop Speaking",
        window: "Window",
        minimize: "Minimize",
        zoom: "Zoom",
        front: "Bring All to Front",
        view: "View",
        reload: "Reload",
        forceReload: "Force Reload",
        toggleDevTools: "Toggle Developer Tools",
        resetZoom: "Reset Zoom",
        toggleFullScreen: "Toggle Full Screen",
    },
    zh: {
        about: "关于",
        services: "服务",
        hide: "隐藏",
        hideOthers: "隐藏其他",
        unhide: "显示全部",
        file: "文件",
        quit: "退出",
        close: "关闭",
        edit: "编辑",
        undo: "撤销",
        redo: "重做",
        cut: "剪切",
        copy: "复制",
        paste: "粘贴",
        delete: "删除",
        selectAll: "全选",
        pasteAndMatchStyle: "粘贴并匹配样式",
        speech: "语音",
        startSpeaking: "开始朗读",
        stopSpeaking: "停止朗读",
        window: "窗口",
        minimize: "最小化",
        zoom: "缩放",
        front: "全部置顶",
        view: "视图",
        reload: "重新加载",
        forceReload: "强制重新加载",
        toggleDevTools: "切换开发者工具",
        resetZoom: "重置缩放",
        toggleFullScreen: "切换全屏",
    },
} as const;

export default (): void => {
    const t = app.getLocale().startsWith("zh") ? i18n.zh : i18n.en;

    const appByMacMenu: IMenu = {
        label: app.name,
        submenu: [
            { label: t.about, role: "about" },
            { type: "separator" },
            { label: t.services, role: "services" },
            { type: "separator" },
            { label: t.hide, role: "hide" },
            { label: t.hideOthers, role: "hideOthers" },
            { label: t.unhide, role: "unhide" },
            { type: "separator" },
            { label: t.quit, role: "quit" },
        ],
    };

    const fileMenu: IMenu = {
        label: t.file,
        submenu: [{ label: t.close, role: "close" }],
    };
    if (runtime.isWin) {
        fileMenu.submenu = [{ label: t.quit, role: "quit" }];
    }

    const editMenu: IMenu = {
        label: t.edit,
        submenu: [
            { label: t.undo, role: "undo" },
            { label: t.redo, role: "redo" },
            { type: "separator" },
            { label: t.cut, role: "cut" },
            { label: t.copy, role: "copy" },
            { label: t.paste, role: "paste" },
        ],
    };
    if (runtime.isWin) {
        editMenu.submenu.push(
            { label: t.delete, role: "delete" },
            { type: "separator" },
            { label: t.selectAll, role: "selectAll" },
        );
    } else {
        editMenu.submenu.push(
            { label: t.pasteAndMatchStyle, role: "pasteAndMatchStyle" },
            { label: t.delete, role: "delete" },
            { label: t.selectAll, role: "selectAll" },
            { type: "separator" },
            {
                label: t.speech,
                submenu: [
                    { label: t.startSpeaking, role: "startSpeaking" },
                    { label: t.stopSpeaking, role: "stopSpeaking" },
                ],
            },
        );
    }

    const windowMenu: IMenu = {
        label: t.window,
        submenu: [
            { label: t.minimize, role: "minimize" },
            { label: t.zoom, role: "zoom" },
        ],
    };
    if (runtime.isWin) {
        windowMenu.submenu.push({ label: t.close, role: "close" });
    } else {
        windowMenu.submenu.push(
            { type: "separator" },
            { label: t.front, role: "front" },
            { type: "separator" },
            { label: t.window, role: "window" },
        );
    }

    const template: MenuItemConstructorOptions[] = [
        editMenu,
        fileMenu,
        {
            label: t.view,
            submenu: [
                { label: t.reload, role: "reload" },
                { label: t.forceReload, role: "forceReload" },
                { label: t.toggleDevTools, role: "toggleDevTools" },
                { type: "separator" },
                { label: t.resetZoom, role: "resetZoom" },
                { type: "separator" },
                { label: t.toggleFullScreen, role: "togglefullscreen" },
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

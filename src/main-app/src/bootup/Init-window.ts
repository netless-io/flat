import { app, BrowserWindow } from "electron";
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";

export default async (context: Context) => {
    await new Promise(resolve => {
        app.on("ready", resolve);
    });

    if (context.runtime.isDevelopment) {
        installExtension([REACT_DEVELOPER_TOOLS]).catch(err =>
            console.log("added extension  failed", err),
        );
    }

    const mainWin = new BrowserWindow({
        width: 375,
        height: 668,
        center: true,
        resizable: false,
        show: false,
        fullscreenable: false,
        maximizable: false,
        webPreferences: {
            autoplayPolicy: "no-user-gesture-required",
            nodeIntegration: true,
            preload: context.runtime.preloadPath,
            webSecurity: false,
        },
    });

    mainWin.center();

    if (context.runtime.isDevelopment) {
        mainWin.webContents.openDevTools();
    }

    void mainWin.loadURL(context.runtime.startURL);

    context.wins.main = mainWin;
};

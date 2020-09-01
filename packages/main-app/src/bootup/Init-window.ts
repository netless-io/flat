import { app, BrowserWindow } from "electron";

export default async (context: Context) => {
    await new Promise(resolve => {
        app.on("ready", resolve);
    });

    const mainWin = new BrowserWindow({
        width: 480,
        height: 480,
        center: true,
        resizable: false,
        show: false,
        webPreferences: {
            autoplayPolicy: "no-user-gesture-required",
            nodeIntegration: true,
            preload: context.runtime.preloadPath,
        },
    });

    mainWin.center();

    if (context.runtime.isDevelopment) {
        mainWin.webContents.openDevTools();
    }

    void mainWin.loadURL(context.runtime.startURL);

    context.wins.main = mainWin;
};

import { ipcMain, app } from "electron";
import { main } from "types-pkg";
import { windows } from "../storage/Windows";

export default (context: Context) => {
    const mainSource = () => {
        const mainWin = context.wins.main;
        const actionsAsync: main.ipc.ActionAsync = {
            "set-win-size": args => {
                args = {
                    autoCenter: false,
                    ...args,
                };

                mainWin.setSize(args.width, args.height);

                if (args.autoCenter) {
                    mainWin.center();
                }
            },
            "set-open-at-login": args => {
                app.setLoginItemSettings({
                    openAtLogin: args.isOpenAtLogin,
                    openAsHidden: false,
                });
            },
            "set-close-window": args => {
                windows.mainState.realClose = args.close;
            },
            "set-title": args => {
                mainWin.setTitle(args.title);
            },
        };

        const actionsSync: main.ipc.ActionSync = {
            "get-runtime": () => {
                return context.runtime;
            },
            "get-open-at-login": () => {
                return app.getLoginItemSettings().openAtLogin;
            },
        };

        ipcMain.on("mainSource", (_event, args: any) => {
            // @ts-ignore
            actionsAsync[args.actions](args.args);
        });

        ipcMain.handle("mainSource", (_event, args: any) => {
            // @ts-ignore
            return actionsSync[args.actions](args.args);
        });
    };

    [mainSource].forEach(source => {
        source();
    });
};

import { ipcMain, app } from "electron";
import { ipc } from "types-pkg";

export default (context: Context) => {
    const mainSource = () => {
        const mainWin = context.wins.main;
        const actionsAsync: ipc.ActionAsync = {
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
            "open-at-login": args => {
                app.setLoginItemSettings({
                    openAtLogin: args.isOpenAtLogin,
                    openAsHidden: false,
                });
            },
        };

        const actionsSync: ipc.ActionSync = {
            "get-runtime": () => {
                return context.runtime;
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

import { ipcMain } from "electron";
import { ipc } from "types-pkg";

export default (context: Context) => {
    const mainSource = () => {
        const mainWin = context.wins.main;
        const actionsAsync: ipc.ActionAsync = {
            "set-win-size": (args: { width: number; height: number; autoCenter?: boolean }) => {
                args = {
                    autoCenter: true,
                    ...args,
                };

                mainWin.setSize(args.width, args.height);

                if (args.autoCenter) {
                    mainWin.center();
                }
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

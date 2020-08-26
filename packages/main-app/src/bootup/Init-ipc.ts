import { ipcMain } from "electron";

export default (context: Context) => {
    const mainSource = () => {
        const mainWin = context.wins.main;
        const actions = {
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

        type ActionKey = keyof typeof actions;
        type UnionTypesMap<T extends ActionKey> = T extends any
            ? {
                  actions: T;
                  args: Parameters<typeof actions[T]>[0];
              }
            : never;
        ipcMain.on("mainSource", (_event, args: UnionTypesMap<ActionKey>) => {
            actions[args.actions](args.args);
        });
    };

    [mainSource].forEach(source => {
        source();
    });
};

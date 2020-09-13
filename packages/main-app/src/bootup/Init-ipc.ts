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

        const actionsAsync = {
            "get-runtime": (args: { needKeys: string[] }) => {
                const result = {};
                args.needKeys.forEach(key => {
                    // @ts-ignore
                    result[key] = context.runtime[key];
                });
                return result;
            },
        };

        ipcMain.on("mainSource", (_event, args: UnionTypesMap<ActionKey>) => {
            actions[args.actions](args.args);
        });

        ipcMain.handle("mainSource", (_event, args: UnionTypesMapAsync<ActionKeyAsync>) => {
            // @ts-ignore
            return actionsAsync[args.actions](args.args);
        });

        type ActionKey = keyof typeof actions;
        type UnionTypesMap<T extends ActionKey> = T extends any
            ? {
                  actions: T;
                  args: Parameters<typeof actions[T]>[0];
              }
            : never;

        type ActionKeyAsync = keyof typeof actionsAsync;
        type UnionTypesMapAsync<T extends ActionKeyAsync> = T extends any
            ? {
                  actions: T;
                  args: Parameters<typeof actionsAsync[T]>[0];
              }
            : never;
    };

    [mainSource].forEach(source => {
        source();
    });
};

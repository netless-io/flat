import { appActionAsync, appActionSync } from "../utils/ipc-actions";
import { ipc } from "flat-types";
import { ipcMain } from "electron";

export default (): void => {
    const appActionAsyncKeys = Object.keys(appActionAsync) as Array<keyof ipc.AppActionAsync>;
    appActionAsyncKeys.forEach(k => {
        ipcMain.on(k, (_event, args: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            appActionAsync[k](args);
        });
    });

    const appActionSyncKeys = Object.keys(appActionSync) as Array<keyof ipc.AppActionSync>;
    appActionSyncKeys.forEach(k => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ipcMain.handle(k, (_event, args) => appActionSync[k](args));
    });
};

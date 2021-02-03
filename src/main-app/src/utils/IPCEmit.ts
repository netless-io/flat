import { windows } from "../storage/Windows";
import { EmitEvents } from "types-pkg/dist/ipc";

export const ipcEmitByMain = <T extends keyof EmitEvents>(
    eventName: T,
    args: EmitEvents[T],
): void => {
    windows.main.webContents.send(eventName, args);
};

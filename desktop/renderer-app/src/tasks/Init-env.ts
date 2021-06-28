import { runtime } from "../utils/runtime";
import { ipcSyncByApp } from "../utils/ipc";

export const initEnv = async (): Promise<void> => {
    const runtimeKeys = Object.keys(runtime);

    const result = await ipcSyncByApp("get-runtime");

    runtimeKeys.forEach(key => {
        // @ts-ignore
        runtime[key] = result[key];
    });
};

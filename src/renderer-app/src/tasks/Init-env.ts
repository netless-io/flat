import { runtime } from "../utils/runtime";
import { ipcSyncByMain } from "../utils/ipc";

const initEnv = async (): Promise<void> => {
    const runtimeKeys = Object.keys(runtime);

    const result = await ipcSyncByMain("get-runtime");

    runtimeKeys.forEach(key => {
        // @ts-ignore
        runtime[key] = result[key];
    });
};

export default initEnv;

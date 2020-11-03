import { runtime } from "../utils/Runtime";
import { ipcSyncByMain } from "../utils/Ipc";

const initEnv = async () => {
    const runtimeKeys = Object.keys(runtime);

    const result = await ipcSyncByMain("get-runtime");

    runtimeKeys.forEach(key => {
        // @ts-ignore
        runtime[key] = result[key];
    });
};

export default initEnv;

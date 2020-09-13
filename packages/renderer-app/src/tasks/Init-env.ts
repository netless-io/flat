import { ipcRenderer } from "electron";
import { runtime, Runtime } from "../utils/runtime";

const initEnv = async () => {
    const runtimeKeys = Object.keys(runtime);

    const result = (await ipcRenderer.invoke("mainSource", {
        actions: "get-runtime",
        args: {
            needKeys: runtimeKeys,
        },
    })) as Runtime;

    runtimeKeys.forEach(key => {
        // @ts-ignore
        runtime[key] = result[key];
    });
};

export default initEnv;

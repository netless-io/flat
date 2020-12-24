import { runtime as runtimeInfo } from "types-pkg";

export const runtime: runtimeInfo.Type = {
    isDevelopment: false,
    isProduction: false,
    startURL: "",
    isMac: false,
    isWin: false,
    staticPath: "",
    preloadPath: "",
    appVersion: "",
    downloadsDirectory: "",
};

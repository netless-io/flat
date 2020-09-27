// 由 Init-env 对其进行初始化
export const runtime: Runtime = {
    isDevelopment: false,
    isProduction: false,
    isMac: false,
    isWin: false,
    appVersion: "",
    downloadsDirectory: "",
};

export type Runtime = {
    isDevelopment: boolean;
    isProduction: boolean;
    isMac: boolean;
    isWin: boolean;
    appVersion: string;
    downloadsDirectory: string;
};

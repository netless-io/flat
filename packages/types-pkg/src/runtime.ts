export type Type = {
    isDevelopment: boolean;
    isProduction: boolean;
    startURL: string;
    isMac: boolean;
    isWin: boolean;
    staticPath: string;
    preloadPath: string;
    assetsPath: string;
    appVersion: string;
    downloadsDirectory: string;
};

export type Key = keyof Type;

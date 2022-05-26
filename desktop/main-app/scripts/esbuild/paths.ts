import path from "path";

export const resolvePath = (...relativePath: string[]): string =>
    path.resolve(__dirname, "..", "..", ...relativePath);

export const dist = resolvePath("dist/index.js");
export const appSrc = resolvePath("src");
export const entryFile = resolvePath("src", "index.ts");
export const preloadPath = resolvePath("src", "preload.ts");
export const tsConfig = resolvePath("tsconfig.json");

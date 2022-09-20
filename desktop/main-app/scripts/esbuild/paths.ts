import path from "path";

const resolvePath = (...relativePath: string[]): string =>
    path.resolve(__dirname, "..", "..", ...relativePath);

export const dist = resolvePath("dist", "main.js");
export const preloadDist = resolvePath("dist", "preload.js");
export const entryFile = resolvePath("src", "index.ts");
export const preloadPath = resolvePath("src", "preload.ts");

const path = require("path");

const resolvePath = (...relativePath) => path.resolve(__dirname, "..", ...relativePath);

module.exports = {
    resolvePath,
    dist: resolvePath("dist"),
    appSrc: resolvePath("src"),
    entryFile: resolvePath("src", "index.ts"),
    preloadPath: resolvePath("src", "preload.ts"),
    tsConfig: resolvePath("tsconfig.json"),
};

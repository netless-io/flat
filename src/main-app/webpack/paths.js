const path = require("path");

const resolvePath = (...relativePath) => path.resolve(__dirname, "..", ...relativePath);

module.exports = {
    dist: resolvePath("dist", "main"),
    appSrc: resolvePath("src"),
    entryFile: resolvePath("src", "index.ts"),
    tsConfig: resolvePath("tsconfig.json"),
};

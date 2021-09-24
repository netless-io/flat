const path = require("path");
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());
const resolvePath = (...relativePath) => path.resolve(appDirectory, ...relativePath);

module.exports = {
    resolvePath,
    appSrc: resolvePath("src"),
    appPublic: resolvePath("public"),
    appBuild: resolvePath("dist"),
    appHtml: resolvePath("public", "index.html"),
    appNodeModules: resolvePath("node_modules"),
    rootNodeModules: resolvePath("..", "..", "node_modules"),
    entryFile: resolvePath("src", "index.ts"),
    tsConfig: resolvePath("tsconfig.json"),
    envConfig: resolvePath("..", "..", "config"),
};

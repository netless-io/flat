const { join } = require("path");

const rootPath = join(__dirname, "..");
const configPath = join(rootPath, "config");
const packagesPath = join(rootPath, "packages");
const desktopPath = join(rootPath, "desktop");
const mainPath = join(desktopPath, "main-app");
const rendererPath = join(desktopPath, "renderer-app");

const rootPackageJSONPath = join(rootPath, "package.json");
const mainPackageJSONPath = join(mainPath, "package.json");

const version = require(mainPackageJSONPath).version;

module.exports.rootPath = rootPath;
module.exports.configPath = configPath;
module.exports.packagesPath = packagesPath;
module.exports.desktopPath = desktopPath;
module.exports.mainPath = mainPath;
module.exports.rendererPath = rendererPath;

module.exports.rootPackageJSONPath = rootPackageJSONPath;
module.exports.mainPackageJSONPath = mainPackageJSONPath;

module.exports.version = version;


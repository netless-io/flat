const { join } = require("path");

const rootPath = join(__dirname, "..");
const configPath = join(rootPath, "config");
const packagesPath = join(rootPath, "packages");
const desktopPath = join(rootPath, "desktop");
const mainPath = join(desktopPath, "main-app");
const rendererPath = join(desktopPath, "renderer-app");

const typesPath = join(packagesPath, "flat-types");
const i18nPath = join(packagesPath, "flat-i18n");
const componentsPath = join(packagesPath, "flat-components");

const typesEntryPath = join(packagesPath, "flat-types", "src");
const i18nEntryPath = join(packagesPath, "flat-i18n");
const componentsEntryPath = join(packagesPath, "flat-components", "src");

const workspacePath = join(rootPath, "pnpm-workspace.yaml");
const rootPackageJSONPath = join(rootPath, "package.json");
const mainPackageJSONPath = join(mainPath, "package.json");

const rootNodeModules = join(rootPath, "node_modules");

const version = require(mainPackageJSONPath).version;

module.exports.rootPath = rootPath;
module.exports.configPath = configPath;
module.exports.packagesPath = packagesPath;
module.exports.desktopPath = desktopPath;
module.exports.mainPath = mainPath;
module.exports.rendererPath = rendererPath;

module.exports.typesPath = typesPath;
module.exports.i18nPath = i18nPath;
module.exports.componentsPath = componentsPath;

module.exports.typesEntryPath = typesEntryPath;
module.exports.i18nEntryPath = i18nEntryPath;
module.exports.componentsEntryPath = componentsEntryPath;

module.exports.workspacePath = workspacePath;
module.exports.rootPackageJSONPath = rootPackageJSONPath;
module.exports.mainPackageJSONPath = mainPackageJSONPath;

module.exports.version = version;

module.exports.rootNodeModules = rootNodeModules;

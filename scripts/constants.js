const { join } = require("path");
const semver = require('semver');

const rootPath = join(__dirname, "..");
const configPath = join(rootPath, "config");
const packagesPath = join(rootPath, "packages");
const desktopPath = join(rootPath, "desktop");
const mainPath = join(desktopPath, "main-app");
const rendererPath = join(desktopPath, "renderer-app");

const rootPackageJSONPath = join(rootPath, "package.json");
const mainPackageJSONPath = join(mainPath, "package.json");

const version = require(mainPackageJSONPath).version;

const prerelease = semver.prerelease(version);
const releaseTag = prerelease === null ? "stable" : prerelease[0];

module.exports.rootPath = rootPath;
module.exports.configPath = configPath;
module.exports.packagesPath = packagesPath;
module.exports.desktopPath = desktopPath;
module.exports.mainPath = mainPath;
module.exports.rendererPath = rendererPath;

module.exports.rootPackageJSONPath = rootPackageJSONPath;
module.exports.mainPackageJSONPath = mainPackageJSONPath;

module.exports.version = version;
module.exports.releaseTag = releaseTag;


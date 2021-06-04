const path = require("path");

const rootPath = path.join(__dirname, "..", "..");
const buildPath = path.join(rootPath, "desktop", "main-app", "release");
const winBuildPath = path.join(buildPath, "win");
const macBuildPath = path.join(buildPath, "mac");
const configPath = path.join(rootPath, "config");
const version = require(path.join(rootPath, "desktop", "main-app", "package.json")).version;
const isBeta = version.includes("beta");

const winArtifactsRegExp = [
    /^latest\.yml$/,
    /^Flat-.+\.exe$/,
    /^Flat-.+\.exe\.blockmap$/,
    /^Flat-.+\.zip$/,
];

const macArtifactsRegExp = [
    /latest-mac\.yml$/,
    /^Flat-.+\.dmg$/,
    /^Flat-.+\.dmg\.blockmap$/,
    /^Flat-.+\.zip$/,
];

module.exports.winBuildPath = winBuildPath;
module.exports.macBuildPath = macBuildPath;
module.exports.configPath = configPath;
module.exports.version = version;
module.exports.isBeta = isBeta;

module.exports.winArtifactsRegExp = winArtifactsRegExp;
module.exports.macArtifactsRegExp = macArtifactsRegExp;

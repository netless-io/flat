const { join } = require("path");
const { mainPath, version } = require("../constants");

const buildPath = join(mainPath, "release");
const winBuildPath = join(buildPath, "win");
const macBuildPath = join(buildPath, "mac");
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
module.exports.isBeta = isBeta;

module.exports.winArtifactsRegExp = winArtifactsRegExp;
module.exports.macArtifactsRegExp = macArtifactsRegExp;

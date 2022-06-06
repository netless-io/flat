const { join } = require("path");
const { mainPath } = require("../constants");

const buildPath = join(mainPath, "release");

const winArtifactsRegExp = [
    /^latest\.yml$/,
    /^(Flat|Flint)-.+\.exe$/,
    /^(Flat|Flint)-.+\.exe\.blockmap$/,
    /^(Flat|Flint)-.+\.zip$/,
];

const macArtifactsRegExp = [
    /latest-mac\.yml$/,
    /^(Flat|Flint)-.+\.dmg$/,
    /^(Flat|Flint)-.+\.dmg\.blockmap$/,
    /^(Flat|Flint)-.+\.zip\.blockmap$/,
    /^(Flat|Flint)-.+\.zip$/,
];

module.exports.winBuildPath = region => {
    return join(buildPath, region, "win");
};
module.exports.macBuildPath = region => {
    return join(buildPath, region, "mac");
};

module.exports.winArtifactsRegExp = winArtifactsRegExp;
module.exports.macArtifactsRegExp = macArtifactsRegExp;

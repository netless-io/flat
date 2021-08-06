const path = require("path");
const semver = require("semver");
const packageJSON = require("../package.json");

const agoraElectronSdkPath = path.join(require.resolve("agora-electron-sdk"), "..", "..");

const prerelease = semver.prerelease(packageJSON.version);
const releaseTag = prerelease === null ? "stable" : prerelease[0];

module.exports.agoraElectronSdkPath = agoraElectronSdkPath;
module.exports.releaseTag = releaseTag;

const path = require("path");

const agoraElectronSdkPath = path.join(require.resolve("agora-electron-sdk"), "..", "..");

module.exports.agoraElectronSdkPath = agoraElectronSdkPath;

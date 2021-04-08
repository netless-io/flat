const path = require("path");

const agoraElectronSdkPath = path.join(require.resolve("agora-electron-sdk"), "..", "..");

const rootPath = path.resolve(__dirname, "..", "..", "..");
const mainAppPath = path.resolve(rootPath, "desktop", "main-app");
const rendererAppPath = path.resolve(rootPath, "desktop", "renderer-app");

module.exports.agoraElectronSdkPath = agoraElectronSdkPath;
module.exports.rootPath = rootPath;
module.exports.mainAppPath = mainAppPath;
module.exports.rendererAppPath = rendererAppPath;

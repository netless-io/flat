const path = require("path");
const fs = require("fs-extra");
const { agoraElectronSdkPath } = require("./constants");

/**
 * get current agora-electron-sdk platform type
 * @return {"win" | "mac" | "none"}
 */
 module.exports.getAgoraReleaseType = () => {
    const agoraElectronReleasePath = path.join(agoraElectronSdkPath, "build", "Release");

    if (fs.existsSync(path.join(agoraElectronReleasePath, "VideoSource.dSYM"))) {
        return "mac";
    } else if (fs.existsSync(path.join(agoraElectronReleasePath, "VideoSource.exe"))) {
        return "win";
    } else {
        return "none";
    }
};

const path = require("path");
const fs = require("fs-extra");
const { agoraElectronSdkPath } = require("./constants");

/**
 * get current agora-electron-sdk platform type
 * @return {"win" | "mac" | "none"}
 */
 module.exports.getAgoraReleaseType = () => {
    const agoraElectronReleasePath = path.join(agoraElectronSdkPath, "build", "platform.txt");

    if (fs.existsSync(agoraElectronReleasePath)) {
        return fs.readFileSync(agoraElectronReleasePath, "utf-8").trim();
    } else {
        return "none";
    }
};

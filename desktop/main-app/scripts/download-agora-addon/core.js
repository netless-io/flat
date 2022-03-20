const { mainPath } = require("../../../../scripts/constants");
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const { agoraElectronSdkPath } = require("../constant");

/**
 * @param {"win" | "mac"} platform
 */
module.exports.downloadAddon = platform => {
    const downloadPath = path.join(__dirname, "patch-download.js");

    spawnSync("node", [downloadPath, platform], {
        cwd: mainPath,
        env: process.env,
        stdio: [process.stdin, process.stdout, process.stderr],
        encoding: "utf-8",
    });

    fs.moveSync(path.join(mainPath, "build"), path.join(agoraElectronSdkPath, "build"), {});
};

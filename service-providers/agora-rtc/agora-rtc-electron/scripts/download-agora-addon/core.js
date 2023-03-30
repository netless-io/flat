const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const { agoraElectronSdkPath } = require("./constants");
const projectRoot = path.join(__dirname, "..", "..");

/**
 * @param {"win" | "mac"} platform
 */
module.exports.downloadAddon = platform => {
    const downloadPath = path.join(__dirname, "patch-download.js");

    spawnSync("node", [downloadPath, platform], {
        cwd: projectRoot,
        env: process.env,
        stdio: [process.stdin, process.stdout, process.stderr],
        encoding: "utf-8",
    });

    const downloaded = path.join(projectRoot, "build");
    if (fs.existsSync(downloaded)) {
        fs.moveSync(downloaded, path.join(agoraElectronSdkPath, "build"), {});
        // This file indicates a successful download.
        fs.writeFileSync(path.join(agoraElectronSdkPath, "build", "platform.txt"), platform);
    }
};

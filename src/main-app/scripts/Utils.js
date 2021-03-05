const { build, Platform } = require("electron-builder");
const yaml = require("js-yaml");
const fs = require("fs-extra");
const path = require("path");
const { platform } = require("os");
const { spawnSync } = require("child_process");
const { agoraElectronSdkPath } = require("./Constant");

/**
 * 构建 electron 应用
 * @param {"win" | "mac"} buildType - 要构建的平台
 */
const buildElectron = async buildType => {
    const config = yaml.safeLoad(
        fs.readFileSync(path.join(__dirname, "..", "electron-builder.yml")),
    );

    config.directories.output = `release/${buildType}`;

    config.extraResources = [
        {
            from: "static",
            to: "static",
        },
    ];

    const packMac = () => {
        return build({
            config: config,
            targets: Platform.MAC.createTarget(),
        });
    };

    const packWin = () => {
        return build({
            config: config,
            targets: Platform.WINDOWS.createTarget(),
        });
    };

    return buildType === "mac" ? packMac() : packWin();
};

/**
 * 获取当前 agora-electron-sdk 所构建的类型
 * @return {"win" | "mac" | "none"}
 */
const getAgoraReleaseType = () => {
    const agoraElectronReleasePath = path.join(agoraElectronSdkPath, "build", "Release");

    if (fs.existsSync(path.join(agoraElectronReleasePath, "VideoSource.dSYM"))) {
        return "mac";
    } else if (fs.existsSync(path.join(agoraElectronReleasePath, "VideoSource.exe"))) {
        return "win";
    } else {
        return "none";
    }
};

const downloadAgoraElectronAddon = platform => {
    const spawnOptions = {
        cwd: path.join(__dirname, ".."),
        env: process.env,
        stdio: [process.stdin, process.stdout, process.stderr],
        encoding: "utf-8",
    };

    if (platform === "mac") {
        spawnSync("npm", ["run", "download:agoraAddon:mac"], spawnOptions);
    } else {
        spawnSync("npm", ["run", "download:agoraAddon:win"], spawnOptions);
    }
};

const currentSystem = () => {
    if (platform() === "darwin") {
        return "mac";
    }

    return "win";
};

module.exports.agoraElectronSdkPath = agoraElectronSdkPath;
module.exports.getAgoraReleaseType = getAgoraReleaseType;
module.exports.buildElectron = buildElectron;
module.exports.downloadAgoraElectronAddon = downloadAgoraElectronAddon;
module.exports.currentSystem = currentSystem;

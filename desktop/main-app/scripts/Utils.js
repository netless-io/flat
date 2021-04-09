const { build, Platform } = require("electron-builder");
const yaml = require("js-yaml");
const fs = require("fs-extra");
const path = require("path");
const { platform } = require("os");
const { spawnSync } = require("child_process");
const { version } = require("../package.json");
const { agoraElectronSdkPath, rootPath, mainAppPath } = require("./Constant");

/**
 * build electron app
 * @param {"win" | "mac"} buildType - build platform
 */
const buildElectron = async buildType => {
    const config = yaml.safeLoad(
        fs.readFileSync(path.join(mainAppPath, "electron-builder.yml"), {
            encoding: "utf8",
        }),
    );

    config.directories.output = path.join("release", buildType);

    if (!version.includes("alpha")) {
        config.releaseInfo.releaseNotes = generateReleaseNote();
    }

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
 * get current agora-electron-sdk platform type
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

const generateReleaseNote = () => {
    const docsReleasesPath = path.join(rootPath, "docs", "releases", `v${version}`);
    const zhNote = fs.readFileSync(path.join(docsReleasesPath, "zh.md"), {
        encoding: "utf8",
    });
    const enNote = fs.readFileSync(path.join(docsReleasesPath, "en.md"), {
        encoding: "utf8",
    });

    return JSON.stringify(
        {
            zhNote,
            enNote,
        },
        null,
        2,
    );
};

module.exports.agoraElectronSdkPath = agoraElectronSdkPath;
module.exports.getAgoraReleaseType = getAgoraReleaseType;
module.exports.buildElectron = buildElectron;
module.exports.downloadAgoraElectronAddon = downloadAgoraElectronAddon;
module.exports.currentSystem = currentSystem;

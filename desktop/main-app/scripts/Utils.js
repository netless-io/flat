const { build, Platform } = require("electron-builder");
const yaml = require("js-yaml");
const fs = require("fs-extra");
const path = require("path");
const { platform } = require("os");
const dotenvFlow = require("dotenv-flow");
const { spawnSync } = require("child_process");
const { version, configPath, rootPath, mainPath } = require("../../../scripts/constants");
const { agoraElectronSdkPath, releaseTag } = require("./Constant");

dotenvFlow.config({
    path: configPath,
    default_node_env: "production",
    silent: true,
});

/**
 * build electron app
 * @param {"win" | "mac"} buildType - build platform
 */
const buildElectron = async buildType => {
    const config = yaml.load(
        fs.readFileSync(path.join(mainPath, "electron-builder.yml"), {
            encoding: "utf8",
        }),
    );

    config.directories.buildResources = path.join("resources", releaseTag);

    config.directories.output = path.join("release", buildType);

    if (!version.includes("alpha")) {
        config.releaseInfo.releaseNotes = generateReleaseNote();
    }

    if (buildType === "mac" && process.env.SKIP_MAC_NOTARIZE === "no") {
        config.afterSign = path.join("scripts", "Notarize.js");
    }

    if (buildType === "win") {
        if (
            process.env.WINDOWS_CODE_SIGNING_CA_PATH &&
            process.env.WINDOWS_CODE_SIGNING_CA_PASSWORD
        ) {
            config.win = {
                ...config.win,
                certificateFile: process.env.WINDOWS_CODE_SIGNING_CA_PATH,
                certificatePassword: process.env.WINDOWS_CODE_SIGNING_CA_PASSWORD,
                signDlls: true,
            };
        }
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
        cwd: mainPath,
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

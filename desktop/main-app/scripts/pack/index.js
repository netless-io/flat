const {
    getAgoraReleaseType,
    generateReleaseNote,
    assertSystemCorrect,
    assertBuildTypeCorrect,
    getBuildType,
} = require("./utils");

const { downloadAgoraElectronAddon } = require("../utils");
const yaml = require("js-yaml");
const fs = require("fs-extra");
const path = require("path");
const { mainPath, version, configPath } = require("../../../../scripts/constants");
const { releaseTag } = require("../constant");
const { build, Platform } = require("electron-builder");
const dotenvFlow = require("dotenv-flow");

dotenvFlow.config({
    path: configPath,
    default_node_env: "production",
    silent: true,
});

assertSystemCorrect();
assertBuildTypeCorrect();

const buildType = getBuildType();

/**
 * build electron app
 * @param {"win" | "mac"} buildType - build platform
 */
const buildElectron = async () => {
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
        config.afterSign = path.resolve(__dirname, "notarize.js");
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

(async () => {
    if (buildType === getAgoraReleaseType()) {
        return buildElectron(buildType);
    }

    downloadAgoraElectronAddon(buildType);

    await buildElectron(buildType);

    // when the build is complete, we need to restore agora addon, otherwise there will be problems if we continue development after the build is complete
    const systemType = process.platform === "darwin" ? "mac" : "win";
    if (systemType !== getAgoraReleaseType()) {
        return downloadAgoraElectronAddon(systemType);
    }
})();

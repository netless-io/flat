const {
    generateReleaseNote,
    assertSystemCorrect,
    assertBuildTypeCorrect,
    getBuildType,
} = require("./utils");
const {
    getAgoraReleaseType,
} = require("@netless/flat-service-provider-agora-rtc-electron/scripts/download-agora-addon/utils");

const yaml = require("js-yaml");
const fs = require("fs-extra");
const path = require("path");
const { mainPath, rendererPath } = require("../../../../scripts/constants");
const { build, Platform } = require("electron-builder");
const dotenvFlow = require("dotenv-flow");
const rimraf = require("rimraf");
const {
    downloadAddon,
} = require("@netless/flat-service-provider-agora-rtc-electron/scripts/download-agora-addon/core");
const { autoChooseConfig, configRegion } = require("../../../../scripts/utils/auto-choose-config");

dotenvFlow.config({
    path: autoChooseConfig(),
    default_node_env: "production",
    silent: true,
});

assertSystemCorrect();
assertBuildTypeCorrect();

const buildType = getBuildType();

const writePackageName = content => {
    fs.writeFileSync(
        path.join(mainPath, "package.json"),
        typeof content === "object" ? JSON.stringify(content, null, 2) : content,
        {
            encoding: "utf-8",
        },
    );
};

/**
 * build electron app
 */
const buildElectron = async () => {
    const config = yaml.load(
        fs.readFileSync(path.join(mainPath, "electron-builder", `${configRegion()}.yml`), {
            encoding: "utf8",
        }),
    );

    config.directories.buildResources = path.join("resources", "icon", configRegion());

    config.directories.output = path.join("release", configRegion(), buildType);

    rimraf.sync(path.join(mainPath, config.directories.output));

    config.releaseInfo.releaseNotes = generateReleaseNote();

    if (buildType === "mac" && process.env.SKIP_MAC_NOTARIZE === "no") {
        config.afterSign = path.resolve(__dirname, "notarize.js");
    }

    if (buildType === "win") {
        if (process.env.WINDOWS_CODE_SIGNING_SERVER) {
            config.win = {
                ...config.win,
                sign: "./scripts/pack/sign.js",
                signDlls: true,
            };
        } else if (
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
            from: path.join(rendererPath, "dist"),
            to: "static",
        },
    ];

    if (buildType === "mac") {
        config.extraResources.push({
            from: "resources/macOS/locals",
            to: "./",
        });
    }

    const packageJSON = fs.readFileSync(path.join(mainPath, "package.json"), {
        encoding: "utf-8",
    });

    writePackageName({
        ...JSON.parse(packageJSON),
        productName: configRegion() === "US" ? "Flint" : "Flat",
    });

    config.afterPack = () => {
        writePackageName(packageJSON);
    };

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
    downloadAddon(buildType);

    await buildElectron(buildType);

    // when the build is complete, we need to restore agora addon, otherwise there will be problems if we continue development after the build is complete
    const systemType = process.platform === "darwin" ? "mac" : "win";
    if (systemType !== getAgoraReleaseType()) {
        return downloadAddon(systemType);
    }
})();

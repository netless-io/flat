const path = require("path");
const { agoraElectronSdkPath } = require("../constant");
const fs = require("fs-extra");
const { version } = require("../../../../scripts/constants");
const { rootPath } = require("../../../../scripts/constants");

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

module.exports.generateReleaseNote = () => {
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

module.exports.assertSystemCorrect = () => {
    if (process.platform !== "win32" && process.platform !== "darwin") {
        throw new Error("Only mac or windows systems are supported for building");
    }
};

module.exports.assertBuildTypeCorrect = () => {
    switch (process.argv[2]) {
        case "mac": {
            if (process.platform === "win32") {
                throw new Error("Cannot build mac on win32 platform");
            }
            break;
        }
        case "win":
        case "auto": {
            break;
        }
        default: {
            throw new Error("Only 'mac' or 'win' build type is supported");
        }
    }
};

module.exports.getBuildType = () => {
    if (process.argv[2] === "auto") {
        return process.platform === "win32" ? "win" : "mac";
    }

    return process.argv[2];
};

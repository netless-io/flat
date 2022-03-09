const path = require("path");
const fs = require("fs-extra");
const { agoraElectronSdkPath } = require("../constant");
const download = require(path.join(agoraElectronSdkPath, "scripts", "download"));

const electronVersion =
    require("../../../../scripts/init-agora-configure/agora-electron-options").electron_version;
const agoraVersion = require(path.join(agoraElectronSdkPath, "package.json")).version;

fs.removeSync(path.join(agoraElectronSdkPath, "build"));

const platform = process.argv[2];

download({
    electronVersion,
    platform: platform === "win" ? "win32" : "darwin",
    arch: platform === "win" ? "x86" : "x64",
    packageVersion: agoraVersion,
    no_symbol: false,
});

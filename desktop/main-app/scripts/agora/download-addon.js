const path = require("path");
const fs = require("fs-extra");
const minimist = require("minimist");
const { agoraElectronSdkPath } = require("../constant");
const download = require(path.join(agoraElectronSdkPath, "scripts", "download"));

const commandsArgs = minimist(process.argv.slice(2));
// delete useless keys
delete commandsArgs._;

const defaultOptions = {
    platform: process.platform === "win32" ? "win32" : "darwin",
    arch: process.platform === "win32" ? "x86" : "x64",
};

const argv = {
    ...defaultOptions,
    ...commandsArgs,
};

const electronVersion =
    require("../../../../scripts/init-agora-configure/agora-electron-options").electron_version;
const agoraVersion = require(path.join(agoraElectronSdkPath, "package.json")).version;

fs.removeSync(path.join(agoraElectronSdkPath, "build"));

download({
    electronVersion,
    platform: argv.platform,
    arch: argv.arch,
    packageVersion: agoraVersion,
    no_symbol: false,
});

const path = require("path");
const fs = require("fs-extra");
const minimist = require("minimist");
const download = require("../node_modules/agora-electron-sdk/scripts/download");
const { agoraElectronSdkPath } = require("./Constant");

const commandsArgs = minimist(process.argv.slice(2));
// delete useless keys
delete commandsArgs._;

const defaultOptions = {
    platform: "mac",
    arch: "x64",
};

const argv = {
    ...defaultOptions,
    ...commandsArgs,
};

const electronVersion = require("../../../package.json").agora_electron.electron_version;
const agoraVersion = require("../node_modules/agora-electron-sdk/package.json").version;

fs.removeSync(path.join(agoraElectronSdkPath, "build"));

download({
    electronVersion,
    platform: argv.platform,
    arch: argv.arch,
    packageVersion: agoraVersion,
});

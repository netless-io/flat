#!/usr/bin/env node

const minimist = require("minimist");
const { electronVersion, log, arch, platform, setAgoraBuildInfo } = require("./utils");

const commandsArgs = minimist(process.argv.slice(2));
// delete useless keys
delete commandsArgs._;

// see: https://github.com/AgoraIO/Electron-SDK/wiki/Installation-Configuration-in-package.json
const defaultOptions = {
    arch,
    platform,
    electron_version: electronVersion,
    msvs_version: "2017",
    silent: false,
    debug: false,
    // No special circumstances, please do not set to false
    prebuilt: true,
};

const argv = {
    ...defaultOptions,
    ...commandsArgs,
};

log("current agora parameters");
log(argv);

setAgoraBuildInfo(argv);

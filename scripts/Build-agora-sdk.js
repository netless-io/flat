const minimist = require("minimist");
const { log, arch, platform, setAgoraBuildInfo } = require("./Utils");

const commandsArgs = minimist(process.argv.slice(2));
// delete useless keys
delete commandsArgs._;

// see: https://github.com/AgoraIO/Electron-SDK/wiki/Installation-Configuration-in-package.json
const defaultOptions = {
    arch,
    platform,
    // agora-electron-sdk currently only supports 7.1.2 pre-compilation, but supports 7.1.14 version of electron
    electron_version: "7.1.2",
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

// see: https://github.com/AgoraIO/Electron-SDK/wiki/Installation-Configuration-in-package.json
const agoraSdkOptions = {
    arch: process.platform === "win32" ? "ia32" : "x64",
    platform: process.platform === "win32" ? "win32" : "darwin",
    electron_version: "11.0.0",
    msvs_version: "2017",
    silent: false,
    debug: false,
    // Please do not set to false unless you know what you are doing.
    prebuilt: true,
};

module.exports = agoraSdkOptions;

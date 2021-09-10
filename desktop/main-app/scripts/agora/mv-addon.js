const shelljs = require("shelljs");
const path = require("path");
const { mainPath } = require("../../../../scripts/constants");
const { agoraElectronSdkPath } = require("./../constant");

// TODO: remove shelljs
shelljs.mv(path.join(mainPath, "build"), path.join(agoraElectronSdkPath, "build"));

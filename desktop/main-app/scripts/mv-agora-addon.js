const shelljs = require("shelljs");
const path = require("path");
const { agoraElectronSdkPath } = require("./Constant");

shelljs.mv(path.join(__dirname, "..", "build"), path.join(agoraElectronSdkPath, "build"));

const fs = require("fs-extra");
const path = require("path");
const { mainPath } = require("../../../../scripts/constants");
const { agoraElectronSdkPath } = require("./../constant");

fs.moveSync(path.join(mainPath, "build"), path.join(agoraElectronSdkPath, "build"));

const path = require("path");
const fs = require("fs-extra");
const { agoraElectronSdkPath } = require("../constant");
const download = require(path.join(agoraElectronSdkPath, "scripts", "download"));
const nativeExtPath = path.join(agoraElectronSdkPath, "build", "Release", "agora_node_ext.node");

if (fs.existsSync(nativeExtPath) && !("FORCE_REBUILD_AGORA_NODE_EXT" in process.env)) {
    // Don't download again.
    process.exit(0);
}

const electronVersion = "12.0.0";
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

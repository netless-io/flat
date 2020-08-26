const { build, Platform } = require("electron-builder");
const yaml = require("js-yaml");
const fs = require("fs-extra");
const path = require("path");

const buildType = process.argv[2];

if (!["mac", "win"].includes(buildType)) {
    throw Error("build type must is: mac or win");
}

const config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, "..", "electron-builder.yml")));

config.directories.output = `release/${buildType}`;

config.extraResources = [
    {
        from: "static",
        to: "static",
    },
];

const packMac = () => {
    void build({
        config: config,
        targets: Platform.MAC.createTarget(),
    });
};

const packWin = () => {
    void build({
        config: config,
        targets: Platform.WINDOWS.createTarget(),
    });
};

(() => {
    buildType === "mac" ? packMac() : packWin();
})();

const {
    getAgoraReleaseType,
    buildElectron,
    downloadAgoraElectronAddon,
    currentSystem,
} = require("./Utils");

let buildType = process.argv[2];

switch (buildType) {
    case "mac": {
        if (process.platform === "win32") {
            throw new Error("Cannot build mac on win32 platform");
        }
        break;
    }
    case "win": {
        break;
    }
    default: {
        switch (process.platform) {
            case "win32": {
                buildType = "win";
                break;
            }
            case "darwin": {
                buildType = "mac";
                break;
            }
            default: {
                throw new Error("Only 'mac' or 'win' build type is supported");
            }
        }
    }
}

(async () => {
    if (buildType === getAgoraReleaseType()) {
        return buildElectron(buildType);
    }

    downloadAgoraElectronAddon(buildType);

    await buildElectron(buildType);

    // when the build is complete, we need to restore agora addon, otherwise there will be problems if we continue development after the build is complete
    const systemType = currentSystem();
    if (systemType !== getAgoraReleaseType()) {
        return downloadAgoraElectronAddon(systemType);
    }
})();

const {
    getAgoraReleaseType,
    buildElectron,
    downloadAgoraElectronAddon,
    currentSystem,
} = require("./Utils");

let buildType = process.argv[2];

if (!["mac", "win"].includes(buildType)) {
    switch(process.platform) {
        case "win32": {
            buildType = "win"
            break
        }
        case "darwin": {
            buildType = "mac"
            break
        }
        default: {
            throw Error("Only 'mac' or 'win' build type is supported");
        }
    }
}

(async () => {
    if (buildType === getAgoraReleaseType()) {
        return buildElectron(buildType);
    }

    downloadAgoraElectronAddon(buildType);

    await buildElectron(buildType);

    // 当构建完成后，我们需要还原 agora addon，否则构建完成后，继续开发的话，就会出现问题
    const systemType = currentSystem();
    if (systemType !== getAgoraReleaseType()) {
        return downloadAgoraElectronAddon(systemType);
    }
})();

const fs = require("fs").promises;
const path = require("path");
const { rootPath } = require("../constants");
const agoraSdkOptions = require("./agora-electron-options");

const npmrcPath = path.join(rootPath, ".npmrc");

writeAgoraToNpmrc().catch(console.error);

async function writeAgoraToNpmrc() {
    const agoraOptions = addAgoraNpmrcPrefix(agoraSdkOptions);
    const options = await readNpmrc(npmrcPath);
    Object.keys(agoraOptions).forEach(key => {
        options[key] = agoraOptions[key];
        process.env[`npm_config_${key}`] = agoraOptions[key];
    });
    await writeNpmrc(npmrcPath, options);
}

function addAgoraNpmrcPrefix(agoraSdkOptions) {
    return Object.keys(agoraSdkOptions).reduce((npmrcOptions, key) => {
        if (key === "electron_version") {
            npmrcOptions[`agora_electron_dependent`] = `${agoraSdkOptions[key]}`;
        }
        npmrcOptions[`agora_electron_${key}`] = `${agoraSdkOptions[key]}`;
        return npmrcOptions;
    }, {});
}

async function readNpmrc(npmrcPath) {
    const npmrcOptions = {};
    try {
        const str = await fs.readFile(npmrcPath, "utf8");
        const optMatcher = /^([^=]+)=([^=]*)$/gm;
        for (let matchResult; (matchResult = optMatcher.exec(str)) !== null; ) {
            npmrcOptions[matchResult[1].trim()] = matchResult[2].trim();
        }
    } catch (e) {
        // empty file
    }
    return npmrcOptions;
}

async function writeNpmrc(npmrcPath, options) {
    const str = Object.keys(options)
        .map(key => `${key}=${options[key]}`)
        .join("\n");
    await fs.writeFile(npmrcPath, str);
}

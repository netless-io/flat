/*eslint-env es6*/

const fs = require("fs");
const os = require("os");
const path = require("path");

const diff = (origin, target) => {
    // array to object map
    target = target.reduce((o, k) => {
        o[k] = "";
        return o;
    }, {});

    return origin.filter(key => target[key] === undefined);
};

const localesPath = path.join(__dirname, "..", "locales");

const i18nJsonFileList = fs
    .readdirSync(localesPath, {
        encoding: "utf8",
    })
    .filter(file => path.extname(file) === ".json");

let polymerization = [];
for (const file of i18nJsonFileList) {
    const fullPath = path.join(localesPath, file);
    const keys = Object.keys(require(fullPath));

    polymerization.push({
        name: file,
        keys,
    });
}
polymerization.sort((a, b) => b.keys.length - a.keys.length);

const calibrationData = polymerization[0];

const errorInfo = [];

// skip first data, because it will be used as calibration data.
for (let i = 1; i < polymerization.length; i++) {
    let errorMessage = "";
    const currentInfo = polymerization[i];

    const mismatchKeys = diff(calibrationData.keys, currentInfo.keys);
    const superfluousKeys = diff(currentInfo.keys, calibrationData.keys);

    if (mismatchKeys.length !== 0) {
        errorMessage += `${currentInfo.name} mismatch keys: ${mismatchKeys}. `;
    }

    if (superfluousKeys.length !== 0) {
        errorMessage += `superfluous keys: ${superfluousKeys}.`;
    }

    if (errorMessage !== "") {
        errorInfo.push(errorMessage);
    }
}

if (errorInfo.length !== 0) {
    console.log(`current calibration file: ${calibrationData.name}`);
    console.log(errorInfo.join(os.EOL), os.EOL);
    process.exit(1);
}

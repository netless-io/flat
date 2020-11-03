const path = require("path");
const editJsonFile = require("edit-json-file");

const log = content => {
    if ({}.toString.call(content) === "[object Object]") {
        console.log(JSON.stringify(content, null, 2));
    } else {
        console.log(content);
    }
};
module.exports.log = log;

module.exports.arch = process.platform === "win32" ? "ia32" : "x64";

module.exports.platform = process.platform === "win32" ? "win32" : "darwin";

const packageJsonFile = editJsonFile(path.resolve(__dirname, "..", "package.json"), {
    stringify_width: 4,
});
module.exports.packageJsonFile = packageJsonFile;

const setAgoraBuildInfo = args => {
    Object.keys(args).forEach(k => {
        packageJsonFile.set(`agora_electron.${k}`, args[k]);
    });
    packageJsonFile.save();
};
module.exports.setAgoraBuildInfo = setAgoraBuildInfo;

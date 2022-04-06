const path = require("path");
const baseLintConfig = require("../../.lintstagedrc.js");

module.exports = {
    ...baseLintConfig,
    "*.json": `node ${JSON.stringify(path.resolve(__dirname, "./scripts/check.js"))}`,
};

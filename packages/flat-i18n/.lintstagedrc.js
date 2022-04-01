const path = require("path");

module.exports = {
    "*.json": `node ${JSON.stringify(path.resolve(__dirname, "./scripts/check.js"))}`,
};

const baseLintConfig = require("../../.lintstagedrc.js");

module.exports = {
    ...baseLintConfig,
    "*.ts": ["eslint --cache --fix", "prettier --write"],
};

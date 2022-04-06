const baseLintConfig = require("../../.lintstagedrc.js");

module.exports = {
    ...baseLintConfig,
    "*.ts": ["tsc --noEmit", "prettier --write"],
};

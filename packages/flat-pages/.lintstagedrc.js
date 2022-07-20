const baseLintConfig = require("../../.lintstagedrc.js");

module.exports = {
    ...baseLintConfig,
    "*.{ts,tsx}": ["eslint --cache --fix", "prettier --write"],
};

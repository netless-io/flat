module.exports = {
    "*.svg": ["svglint", "svgo"],
    "*.{ts,tsx}": ["eslint --cache --fix", "prettier --write"],
    "*.{md,ts,tsx,js,css,less,json,yml,yaml,html,sh}": "cspell --no-progress --no-must-find-files",
};

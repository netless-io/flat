module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                modules: false,
            },
        ],
        [
            "@babel/preset-typescript",
            {
                onlyRemoveTypeImports: true,
            },
        ],
    ],
    plugins: [
        "@babel/plugin-transform-runtime",
        "@babel/plugin-proposal-export-default-from",
        "@babel/plugin-proposal-class-properties",
    ],
};

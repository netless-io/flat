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
    plugins: ["@babel/plugin-transform-runtime"],
};

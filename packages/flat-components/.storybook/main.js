const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
    stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "storybook-react-i18next",
        "@storybook/addon-viewport",
    ],
    core: {
        builder: "webpack5",
    },
    webpackFinal: config => {
        config.plugins.push(
            new ESLintPlugin({
                fix: true,
                extensions: ["ts", "tsx"],
            }),
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: path.resolve(__dirname, "..", "tsconfig.json"),
                    diagnosticOptions: {
                        semantic: true,
                        syntactic: true,
                        declaration: true,
                    },
                },
            }),
        );

        config.module.rules.unshift({
            test: /\.(sass|scss)(\?.*)?$/i,
            sideEffects: true,
            use: [
                { loader: require.resolve("style-loader") },
                { loader: require.resolve("css-loader") },
                { loader: require.resolve("sass-loader") },
            ],
        });

        config.module.rules.unshift({
            test: /\.less$/,
            sideEffects: true,
            use: [
                {
                    loader: "style-loader",
                },
                {
                    loader: "css-loader",
                },
                {
                    loader: "less-loader",
                    options: {
                        lessOptions: {
                            javascriptEnabled: true,
                        },
                    },
                },
            ],
        });

        config.resolve.alias = {
            ...config.resolve.alias,
            "flat-types": path.resolve(__dirname, "..", "..", "flat-types", "src"),
            "flat-i18n": path.resolve(__dirname, "..", "..", "flat-i18n", "locales"),
        };

        return config;
    },
};

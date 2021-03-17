const path = require("path");

module.exports = {
    stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(ts|tsx)"],
    addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
    webpackFinal: async config => {
        config.module.rules = config.module.rules.filter(rule => {
            return !(rule.loader && rule.loader.includes("file-loader"));
        });

        config.module.rules.unshift(
            {
                test: /\.less$/,
                sideEffects: true,
                use: [
                    { loader: require.resolve("style-loader") },
                    { loader: require.resolve("css-loader") },
                    { loader: require.resolve("less-loader") },
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|ico|apng)(\?.*)?$/i,
                use: [
                    {
                        loader: require.resolve("url-loader"),
                        options: {
                            limit: 14336,
                            name: "static/media/[name].[hash:8].[ext]",
                            esModule: false,
                        },
                    },
                ],
            },
            {
                test: /\.(eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/i,
                loader: require.resolve("file-loader"),
                options: { name: "static/media/[name].[hash:8].[ext]", esModule: false },
            },
        );

        return config;
    },
};

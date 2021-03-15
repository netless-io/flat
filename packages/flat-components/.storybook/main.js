const path = require("path");

module.exports = {
    stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(ts|tsx)"],
    addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
    webpackFinal: async config => {
        config.module.rules.push({
            test: /\.less$/,
            use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "less-loader" }],
        });
        return config;
    },
};

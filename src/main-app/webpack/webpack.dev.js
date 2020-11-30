const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const { NamedModulesPlugin, NoEmitOnErrorsPlugin } = require("webpack");
const ElectronWebpackPlugin = require("./plugin/electron-webpack-plugin");

module.exports = merge(common, {
    mode: "development",

    devtool: "eval-cheap-module-source-map",

    watch: true,
    watchOptions: {
        aggregateTimeout: 600,
        ignored: ["node_modules/**"],
    },

    plugins: [
        new NamedModulesPlugin(),
        new NoEmitOnErrorsPlugin(),
        new ElectronWebpackPlugin("yarn run launch:electron"),
    ],
});

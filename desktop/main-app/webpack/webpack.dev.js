const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const { NoEmitOnErrorsPlugin } = require("webpack");
const ElectronWebpackPlugin = require("./plugin/electron-webpack-plugin");

module.exports = merge(common, {
    mode: "development",

    watch: true,
    watchOptions: {
        aggregateTimeout: 600,
        ignored: ["node_modules/**"],
    },

    plugins: [new NoEmitOnErrorsPlugin(), new ElectronWebpackPlugin("yarn run _launch:electron")],
});

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const { NamedModulesPlugin, NoEmitOnErrorsPlugin } = require("webpack");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = merge(common, {
    mode: "development",

    devtool: "eval-cheap-module-source-map",

    plugins: [
        new NamedModulesPlugin(),
        new NoEmitOnErrorsPlugin(),
        new ReactRefreshWebpackPlugin({
            // @TODO wait until MobX issues fixed
            overlay: false,
        }),
    ],

    output: {
        filename: "static/js/bundle.js",
        path: undefined,
        chunkFilename: "static/js/[name].chunk.js",
        publicPath: "/",
    },
});

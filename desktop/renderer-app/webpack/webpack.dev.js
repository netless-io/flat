const paths = require("./paths");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = merge(common, {
    mode: "development",

    devtool: "eval-cheap-module-source-map",

    plugins: [
        new ReactRefreshWebpackPlugin({
            // @TODO wait until MobX issues fixed
            overlay: false,
        }),
    ],

    output: {
        filename: "static/js/[name].js",
        path: paths.appBuild,
        chunkFilename: "static/js/[name].chunk.js",
        publicPath: "/",
    },
});

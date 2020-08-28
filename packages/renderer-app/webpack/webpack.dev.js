const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const { NamedModulesPlugin } = require("webpack");

module.exports = merge(common, {
    mode: "development",

    devtool: "eval-cheap-module-source-map",

    output: {
        filename: "static/js/bundle.js",
        path: undefined,
        chunkFilename: "static/js/[name].chunk.js",
        publicPath: "/",
    },
});

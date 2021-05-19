const paths = require("./paths");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "production",

    output: {
        filename: "static/js/[name].[contenthash:8].js",
        path: paths.appBuild,
        clean: true,
        chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
    },
});

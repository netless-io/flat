const paths = require("./paths");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = merge(common, {
    mode: "production",

    plugins: [process.env.ANALYZER && new BundleAnalyzerPlugin()].filter(Boolean),

    output: {
        filename: "static/js/[name].[contenthash:8].js",
        path: paths.appBuild,
        clean: true,
        chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
    },
});

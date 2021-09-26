const path = require("path");
const paths = require("./paths");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = merge(common, {
    mode: "production",

    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.join(paths.rootNodeModules, "monaco-editor", "min", "vs"),
                    to: path.join(paths.appBuild, "static", "monaco-editor", "min", "vs"),
                },
                {
                    // inject monaco-editor source-map
                    from: path.join(paths.rootNodeModules, "monaco-editor", "min-maps", "vs"),
                    to: path.join(paths.appBuild, "static", "monaco-editor", "min-maps", "vs"),
                },
            ],
        }),
        process.env.ANALYZER && new BundleAnalyzerPlugin(),
    ].filter(Boolean),

    output: {
        filename: "static/js/[name].[contenthash:8].js",
        path: paths.appBuild,
        clean: true,
        chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
    },
});

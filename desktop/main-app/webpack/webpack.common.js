const paths = require("./paths");
const DotenvFlow = require("dotenv-flow-webpack");
const ESLintPlugin = require("eslint-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
    entry: {
        main: paths.entryFile,
        preload: paths.preloadPath,
    },
    target: "electron-main",

    devtool: "inline-source-map",

    stats: {
        colors: true,
    },

    node: {
        __filename: isDevelopment,
        __dirname: isDevelopment,
    },

    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },

    plugins: [
        new DotenvFlow({
            path: paths.envConfig,
            system_vars: true,
            default_node_env: "development",
        }),
        new ESLintPlugin({
            fix: true,
            extensions: "ts",
        }),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: paths.tsConfig,
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                    declaration: true,
                },
            },
        }),
    ],

    externalsPresets: {
        node: true,
    },
    externals: [
        nodeExternals({
            modulesFromFile: true,
        }),
    ],

    resolve: {
        extensions: [".ts", ".js", ".node"],
        alias: {
            "flat-types": paths.resolvePath("..", "..", "packages", "flat-types", "src"),
        },
    },

    output: {
        filename: "[name].js",
        path: paths.dist,
        libraryTarget: "commonjs2",
    },
};

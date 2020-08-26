const paths = require("./paths");
const threadLoader = require("thread-loader");
const DotenvFlow = require("dotenv-flow-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const { NoEmitOnErrorsPlugin, NamedModulesPlugin } = require("webpack");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const isDevelopment = process.env.NODE_ENV === "development";

const workerCommonOptions = {
    workerParallelJobs: 50,
    poolParallelJobs: 50,
    poolTimeout: isDevelopment ? Infinity : 1000,
    workerNodeArgs: ["--max-old-space-size=2048"],
};

const tsWorkerOptions = {
    ...workerCommonOptions,
    name: "ts-pool",
};

const lessWorkerOptions = {
    ...workerCommonOptions,
    name: "css-pool",
};

const cssWorkerOptions = {
    ...workerCommonOptions,
    name: "css-pool",
};

threadLoader.warmup(tsWorkerOptions, ["babel-loader", "eslint-loader"]);

threadLoader.warmup(cssWorkerOptions, ["style-loader", "css-loader"]);

module.exports = {
    entry: [paths.entryFile],
    target: "electron-renderer",

    module: {
        rules: [
            {
                test: /\.ts(x)?$/,
                use: [
                    {
                        loader: "thread-loader",
                        options: tsWorkerOptions,
                    },
                    {
                        loader: "babel-loader",
                    },
                    {
                        loader: "eslint-loader",
                        options: {
                            fix: true,
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "thread-loader",
                        options: lessWorkerOptions,
                    },
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "thread-loader",
                        options: cssWorkerOptions,
                    },
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac)$/,
                loader: "url-loader",
                options: {
                    limit: 1,
                    name: "static/media/[name].[hash:7].[ext]",
                    path: paths.appBuild,
                },
            },
        ],
    },

    plugins: [
        new DotenvFlow({
            path: paths.envConfig,
            system_vars: true,
            default_node_env: "development",
        }),
        isDevelopment && new ReactRefreshWebpackPlugin(),
        new ProgressBarPlugin(),
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
        }),
        !isDevelopment && new NamedModulesPlugin(),
        !isDevelopment && new CleanWebpackPlugin(),
        !isDevelopment && new NoEmitOnErrorsPlugin(),

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
    ].filter(Boolean),

    externals: [nodeExternals()],

    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
};

const paths = require("./paths");
const threadLoader = require("thread-loader");
const DotenvFlow = require("dotenv-flow-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const { NoEmitOnErrorsPlugin, NamedModulesPlugin } = require("webpack");
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

threadLoader.warmup(tsWorkerOptions, ["eslint-loader", "babel-loader"]);

threadLoader.warmup(cssWorkerOptions, ["css-loader", "style-loader"]);

threadLoader.warmup(lessWorkerOptions, ["less-loader", "css-loader", "style-loader"]);

module.exports = {
    entry: [paths.entryFile],
    target: "electron-renderer",

    module: {
        rules: [
            {
                test: /\.ts(x)?$/,
                use: [
                    {
                        loader: "babel-loader",
                    },
                    {
                        loader: "eslint-loader",
                        options: {
                            fix: true,
                        },
                    },
                    {
                        loader: "thread-loader",
                        options: tsWorkerOptions,
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "less-loader", // compiles Less to CSS
                        options: {
                            lessOptions: {
                                modifyVars: {
                                    "primary-color": "#106BC5",
                                    "link-color": "#106BC5",
                                    "border-radius-base": "4px",
                                },
                                javascriptEnabled: true,
                            },
                        },
                    },
                    {
                        loader: "thread-loader",
                        options: lessWorkerOptions,
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "thread-loader",
                        options: cssWorkerOptions,
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

    optimization: {
        runtimeChunk: "single",
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: "initial",
                    minChunks: 2,
                    maxInitialRequests: 5,
                    minSize: 0,
                },
                vendor: {
                    test: /node_modules/,
                    chunks: "initial",
                    name: "vendor",
                    priority: 10,
                    enforce: true,
                },
            },
        },
    },

    plugins: [
        new ProgressBarPlugin(),
        new DotenvFlow({
            path: paths.envConfig,
            system_vars: true,
            default_node_env: "development",
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
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
    ].filter(Boolean),

    externals: {
        "agora-electron-sdk": "commonjs2 agora-electron-sdk",
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
};

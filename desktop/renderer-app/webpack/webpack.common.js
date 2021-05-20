const paths = require("./paths");
const webpack = require("webpack");
const threadLoader = require("thread-loader");
const DotenvFlow = require("dotenv-flow-webpack");
const ESLintPlugin = require("eslint-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const isDevelopment = process.env.NODE_ENV === "development";

const workerCommonOptions = {
    workerParallelJobs: 50,
    poolParallelJobs: 50,
    poolTimeout: isDevelopment ? Infinity : 1000,
    workerNodeArgs: ["--max-old-space-size=2048"],
};

const lessWorkerOptions = {
    ...workerCommonOptions,
    name: "css-pool",
};

const cssWorkerOptions = {
    ...workerCommonOptions,
    name: "css-pool",
};

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
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                        },
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
                                    "primary-color": "#3381FF",
                                    "link-color": "#3381FF",
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
                test: /\.(png|jpe?g|gif|svg)$/,
                loader: "url-loader",
                options: {
                    limit: 1,
                    name: "static/assets/image/[name].[hash:7].[ext]",
                    path: paths.appBuild,
                },
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
                loader: "url-loader",
                options: {
                    limit: 1,
                    name: "static/assets/media/[name].[ext]",
                    path: paths.appBuild,
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf)$/,
                loader: "url-loader",
                options: {
                    limit: 1,
                    name: "static/assets/font/[name].[ext]",
                    path: paths.appBuild,
                },
            },
        ],
    },

    optimization: {
        runtimeChunk: "single",
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
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
        new webpack.ProgressPlugin(),
        new DotenvFlow({
            path: paths.envConfig,
            system_vars: true,
            default_node_env: "development",
        }),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|zh-cn/),
        new ESLintPlugin({
            fix: true,
            extensions: ["ts", "tsx"],
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
    ],

    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
};

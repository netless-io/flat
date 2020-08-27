const path = require("path");
const paths = require("./paths");
const threadLoader = require("thread-loader");
const DotenvFlow = require("dotenv-flow-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const WebpackDevServerOutput = require("webpack-dev-server-output");
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
                        loader: "less-loader",
                        options: {
                            lessOptions: {
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
                test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|node)$/,
                loader: "url-loader",
                options: {
                    limit: 1,
                    name: "static/media/[name].[hash:7].[ext]",
                    path: paths.appBuild,
                },
            },
            {
                test: /\.node$/,
                use: [
                    {
                        loader: "native-addon-loader",
                        options: {
                            path: "static/addon/[name].[hash:7].[ext]",
                        },
                    },
                ],

                include: path.join(__dirname, "..", "node_modules"),
            },
        ],
    },

    plugins: [
        new DotenvFlow({
            path: paths.envConfig,
            system_vars: true,
            default_node_env: "development",
        }),
        new ReactRefreshWebpackPlugin(),
        new ProgressBarPlugin(),
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
        }),
        !isDevelopment && new NamedModulesPlugin(),
        !isDevelopment && new CleanWebpackPlugin(),
        !isDevelopment && new NoEmitOnErrorsPlugin(),
        new WebpackDevServerOutput({
            path: "output-path",
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
        "agora-electron-sdk": "commonjs2 agora-electron-sdk"
        // nodeExternals({
        //     importType: module => {
        //         if (module === "agora-electron-sdk") {
        //             return "commonjs2 agora-electron-sdk";
        //         }

        //         return `${module}`
        //         // return `commonjs ${module}`;
        //     },
        // }),
    },

    resolve: {
        extensions: ["node", ".ts", ".tsx", ".js"],
    },
};

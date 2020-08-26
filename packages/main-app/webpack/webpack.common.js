const paths = require("./paths");
const threadLoader = require("thread-loader");
const nodeExternals = require("webpack-node-externals");
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

threadLoader.warmup(tsWorkerOptions, ["babel-loader", "eslint-loader"]);

module.exports = {
    entry: [paths.entryFile],
    target: "electron-main",

    stats: {
        assets: false,
        cached: false,
        cachedAssets: false,
        colors: true,
        children: true,
        chunks: false,
        chunkModules: false,
        chunkOrigins: false,
        modules: false,
        publicPath: false,
        reasons: false,
        source: false,
        timings: true,
        usedExports: false,
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
        ],
    },

    plugins: [
        new NamedModulesPlugin(),
        new NoEmitOnErrorsPlugin(),
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

    externals: [nodeExternals()],

    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "main.js",
        path: paths.dist,
    },
};

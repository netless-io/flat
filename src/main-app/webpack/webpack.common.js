const paths = require("./paths");
const threadLoader = require("thread-loader");
const DotenvFlow = require("dotenv-flow-webpack");
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

threadLoader.warmup(tsWorkerOptions, ["eslint-loader", "babel-loader"]);

module.exports = {
    entry: {
        main: paths.entryFile,
        preload: paths.preloadPath,
    },
    target: "electron-main",

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
        ],
    },

    plugins: [
        new DotenvFlow({
            path: paths.envConfig,
            system_vars: true,
            default_node_env: "development",
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

    externals: {
        "agora-electron-sdk": "commonjs2 agora-electron-sdk",
        "jquery": "commonjs2 jquery"
    },

    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "[name].js",
        path: paths.dist,
        libraryTarget: "commonjs2",
    },
};

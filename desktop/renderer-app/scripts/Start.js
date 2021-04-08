const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("../webpack/webpack.dev.js");

const compiler = Webpack(webpackConfig);

/** @type {import("webpack-dev-server").Configuration} */
const devServerOptions = {
    stats: {
        colors: true,
        assets: true,
        hash: true,
        builtAt: true,
        chunkOrigins: false,
        chunkModules: false,
        cached: false,
        chunks: false,
        children: false,
        cachedAssets: false,
        modules: false,
        providedExports: false,
        reasons: false,
    },
    hot: true,
    compress: true,
    clientLogLevel: "silent",
    noInfo: true,
    overlay: false,
    historyApiFallback: true,
};

const server = new WebpackDevServer(compiler, devServerOptions);

server.listen(3000, "127.0.0.1", err => {
    if (err) {
        return console.log(err);
    }
});

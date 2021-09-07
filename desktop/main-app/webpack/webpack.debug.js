const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const { NoEmitOnErrorsPlugin } = require("webpack");

module.exports = merge(common, {
    mode: "development",

    plugins: [new NoEmitOnErrorsPlugin()],
});

const { spawn } = require("child_process");

function ElectronWebpackPlugin(options) {
    const defaultOptions = {
        path: "dist/main/main.js",
    };

    this.electronProcess = null;
    this.manualRestart = false;

    this.options = Object.assign(defaultOptions, options);
}

ElectronWebpackPlugin.prototype.apply = function (compiler) {
    compiler.hooks.compile.tap("electron-webpack-dev-runner", compilation => {
        if (this.electronProcess !== null) {
            this.manualRestart = true;
            this.electronProcess.kill();
            this.electronProcess = null;
            setImmediate(() => this.startElectron());

            setTimeout(() => {
                this.manualRestart = false;
            }, 2000);
        } else {
            setImmediate(() => this.startElectron());
        }
    });
};

ElectronWebpackPlugin.prototype.startElectron = function () {
    this.electronProcess = spawn("electron", [this.options.path], {
        shell: true,
        env: process.env,
        stdio: "inherit",
    })
        .on("close", code => {
            if (!this.manualRestart) {
                this.electronProcess.kill();
            }
        })
        .on("error", spawnError => console.error(spawnError));
};

module.exports = ElectronWebpackPlugin;

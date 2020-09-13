import path from "path";
import { app } from "electron";
import { platform } from "os";

export class Runtime {
    public get isDevelopment() {
        return process.env.NODE_ENV === "development";
    }

    public get isProduction() {
        return process.env.NODE_ENV === "production";
    }

    public get startURL() {
        return this.isProduction
            ? `file://${__dirname}/../static/render/index.html`
            : "http://localhost:3000";
    }

    public get isMac() {
        return platform() === "darwin";
    }

    public get isWin() {
        return platform() === "win32";
    }

    public get staticPath() {
        return this.isProduction
            ? path.join(__dirname, "..", "static")
            : path.resolve(__dirname, "..", "..", "static");
    }

    public get preloadPath() {
        return this.isProduction
            ? path.join(__dirname, "preload.js")
            : path.resolve(__dirname, "..", "..", "preload.js");
    }

    public get appVersion(): string {
        if (this.isProduction) {
            return app.getVersion();
        }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require("../../package.json").version;
    }

    public get downloadsDirectory(): string {
        return path.join(app.getPath("userData"), "downloads");
    }
}

export default new Runtime();

import path from "path";
import { app } from "electron";
import { platform } from "os";
import { runtime as Runtime } from "flat-types";

const isDevelopment = process.env.NODE_ENV === "development";

const isProduction = process.env.NODE_ENV === "production";

const assetsPath = isProduction
    ? `file://${path.resolve(__dirname, "..", "static", "render", "static", "assets")}`
    : `file://${path.resolve(__dirname, "..", "..", "..", "renderer-app", "src", "assets")}`;

const startURL = isProduction
    ? `file://${path.resolve(__dirname, "..", "static", "render", "index.html")}`
    : "http://localhost:3000";

const isMac = platform() === "darwin";

const isWin = platform() === "win32";

const staticPath = isProduction
    ? path.join(__dirname, "..", "static")
    : path.resolve(__dirname, "..", "..", "static");

const preloadPath = isProduction
    ? path.join(__dirname, "preload.js")
    : path.resolve(__dirname, "..", "..", "dist", "preload.js");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appVersion = isProduction ? app.getVersion() : require("../../package.json").version;

const downloadsDirectory = path.join(app.getPath("userData"), "downloads");

const runtime: Runtime.Type = {
    isDevelopment,
    isProduction,
    startURL,
    isMac,
    isWin,
    staticPath,
    preloadPath,
    appVersion,
    downloadsDirectory,
    assetsPath,
};

export default runtime;

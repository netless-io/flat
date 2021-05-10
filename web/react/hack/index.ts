/**
 * TODO: since white-web-sdk currently not exports vite compatible lib,
 *       we hack into its source code to create a umd one.
 *       wait for white-web-sdk to fix it so we could remove this hack.
 */

/// <reference types="node" />

import fs from "fs";
import path from "path";
import https from "https";
import zlib from "zlib";
import { Readable } from "stream";

const sdkPath = path.resolve(__dirname, "../node_modules/white-web-sdk");
const pkgJSON = path.resolve(sdkPath, "package.json");

function hackAndReplaceMainScript(script: string, main: string): void {
    const prefix = "window.WhiteWebSdk=(function(require){";
    const suffix = "\nreturn module.WhiteWebSdk;})(function(){return undefined});";
    if (!script.startsWith(prefix)) {
        console.error("hack error: bad prefix string");
        process.exit(1);
    }
    if (!script.endsWith(suffix)) {
        console.error("hack error: bad suffix string");
        process.exit(2);
    }
    // strip prefix and suffix to get the original "var" script
    script = script.substring(prefix.length, script.length - suffix.length);
    // convert "var" script to cjs script
    script = script.replace(/^var module=/, "module.exports=");
    // replace all "require(...)" with undefined
    // so that rollup/esbuild will not throw errors when resolving node libraries
    // these libraries are not needed in fact
    // webpack will add polyfill under the hood so it is ok, but not rollup/esbuild
    script = script.replace(/=require\([^)]+\)/g, "=void 0");
    fs.writeFileSync(path.resolve(sdkPath, main), script);
    console.log("hack: done!");
}

if (fs.existsSync(pkgJSON)) {
    const json = JSON.parse(fs.readFileSync(pkgJSON, "utf-8"));
    const { main, version } = json;

    // this file is created by webpack4 with targeting "var"
    const varURL = `https://sdk.netless.link/white-web-sdk/${version}.js`;
    https
        .get(varURL, res => {
            let script = "";
            let output: Readable = res;
            if (res.headers["content-encoding"] === "gzip") {
                const gzip = zlib.createGunzip();
                res.pipe(gzip);
                output = gzip;
            }
            output.on("data", d => {
                script += d;
            });
            output.on("end", () => {
                hackAndReplaceMainScript(script, main);
            });
        })
        .on("error", err => {
            console.log("hack error: ", err);
        });
}

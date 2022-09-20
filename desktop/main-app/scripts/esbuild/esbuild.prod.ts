import esbuild from "esbuild";
import { dotenvPlugin, external } from "./esbuild.common";
import * as paths from "./paths";

const buildPreload = esbuild.build({
    entryPoints: [paths.preloadPath],
    bundle: true,
    platform: "browser",
    target: "chrome89",
    external: [...external, "electron", "os", "path"],
    outfile: paths.preloadDist,
    plugins: [dotenvPlugin],
});

const buildMain = esbuild.build({
    entryPoints: [paths.entryFile],
    bundle: true,
    platform: "node",
    target: "node14",
    external: [...external, "electron", "electron-devtools-vendor"],
    sourcemap: true,
    outfile: paths.dist,
    plugins: [dotenvPlugin],
});

Promise.all([buildPreload, buildMain]).catch(() => process.exit(1));

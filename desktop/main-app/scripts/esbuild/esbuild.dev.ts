import { platform } from "os";
import { ChildProcess, spawn } from "child_process";
import esbuild from "esbuild";
import { dotenvPlugin, external, replaceMetaPlugin } from "./esbuild.common";
import * as paths from "./paths";

let child: ChildProcess | undefined;
const respawn = () => {
    if (child) {
        child.kill("SIGTERM");
    }
    const bin = platform() === "win32" ? "pnpm.cmd" : "pnpm";
    child = spawn(bin, ["electron", paths.dist], { stdio: "inherit" });
};

const buildPreload = esbuild.build({
    entryPoints: [paths.preloadPath],
    bundle: true,
    platform: "browser",
    target: "chrome89",
    external: [...external, "electron", "os", "path"],
    outfile: paths.preloadDist,
    watch: true,
});

const buildMain = esbuild.build({
    entryPoints: [paths.entryFile],
    bundle: true,
    platform: "node",
    target: "node14",
    external: [...external, "electron", "electron-devtools-vendor"],
    sourcemap: true,
    outfile: paths.dist,
    watch: {
        onRebuild(error) {
            if (error) {
                console.error("watch build failed:", error);
            } else {
                respawn();
            }
        },
    },
    plugins: [dotenvPlugin, replaceMetaPlugin],
});

const allDone = Promise.all([buildPreload, buildMain]);

const stop = () =>
    allDone.then(rs => rs.forEach(r => r.stop && r.stop())).catch(() => process.exit(1));

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

allDone.then(respawn);

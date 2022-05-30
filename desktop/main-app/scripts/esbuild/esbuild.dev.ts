import esbuild, { Message } from "esbuild";
import { esbuildOption } from "./esbuild.common";
import { buildPreLoadDev } from "./esbuild.preload";
import { ChildProcess, spawn } from "child_process";
import * as paths from "./paths";

let child: ChildProcess | undefined;
(async () => {
    await Promise.all([esbuild.build(esbuildOption), buildPreLoadDev()]).then(res => {
        const errors: Message[] = [];
        const warning: Message[] = [];

        res.forEach(item => {
            errors.push(...item.errors);
            warning.push(...item.errors);
        });
        console.info(`has ${errors.length} error,${warning.length} warning`);

        if (child) {
            child.kill("SIGTERM");
        }

        if (errors.length > 0) {
            return;
        }

        child = spawn("pnpm", ["electron", paths.dist], { stdio: "inherit" });
    });
})();

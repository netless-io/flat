import fs from "fs";
import esbuild, { Plugin } from "esbuild";

import less from "./esbuild-plugin-less";
import { externals } from "./vite-plugin-electron";

// TODO: find new place to store vite-plugin-dotenv
import { dotenv } from "../../../web/flat-web/scripts/vite-plugin-dotenv";
import { autoChooseConfig } from "../../../scripts/utils/auto-choose-config";
const mode = process.argv.includes("development") ? "development" : "production";
const configShim: { define: Record<string, string> } = { define: {} };
(dotenv(autoChooseConfig()) as any).config(configShim, { mode });

import copy from "rollup-plugin-copy";
import path from "path";
import { rootNodeModules, rendererPath } from "../../../scripts/constants";
const rawCopyPlugin = copy({
    targets: [
        /**
         * e.g:
         * /Users/black-hole/Code/Job/Agora/flat/node_modules/monaco-editor/min/vs
         * to
         * /Users/black-hole/Code/Job/Agora/flat/desktop/renderer-app/dist/monaco-editor/min/vs
         */
        {
            src: path.join(rootNodeModules, "monaco-editor", "min", "vs"),
            // don't write "vs". because dist path will is: dist/monaco-editor/min/vs/vs
            dest: path.join(rendererPath, "dist", "monaco-editor", "min"),
        },
        {
            src: path.join(rootNodeModules, "monaco-editor", "min-maps", "vs"),
            dest: path.join(rendererPath, "dist", "monaco-editor", "min-maps"),
        },
    ],
}) as { buildEnd: () => Promise<void> };
const copyPlugin: Plugin = {
    name: "copy",
    setup({ onEnd }) {
        onEnd(() => rawCopyPlugin.buildEnd());
    },
};

fs.rmSync("dist", { maxRetries: 3, recursive: true });

let task = esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    format: "cjs",
    outdir: "dist",
    plugins: [less(), copyPlugin],
    target: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
    minify: mode === "production",
    sourcemap: true,
    define: configShim.define,
    loader: {
        ".svg": "file",
        ".png": "file",
        ".mp3": "file",
        ".gif": "file",
    },
    external: externals,
    logLimit: 3,
    logLevel: "info",
    legalComments: "linked",
});

task.catch(() => process.exit(1));

import esbuild from "esbuild";
import fs from "fs";
import path from "path";

import { rendererPath, rootNodeModules } from "../../../scripts/constants";
import { autoChooseConfig } from "../../../scripts/utils/auto-choose-config";
import { dotenv } from "../../../web/flat-web/scripts/vite-plugin-dotenv";
import copy from "./esbuild-plugin-copy";
import less from "./esbuild-plugin-less";
import { externals } from "./vite-plugin-electron";

const mode = process.env.NODE_ENV || "production";

const configShim: { define: Record<string, string> } = { define: {} };
(dotenv(autoChooseConfig()) as any).config(configShim, { mode });

try {
    fs.rmSync("dist", { maxRetries: 3, recursive: true });
} catch {}

let task = esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    format: "cjs",
    outdir: "dist",
    plugins: [
        less(),
        copy({
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
        }),
    ],
    target: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
    minify: mode === "production",
    sourcemap: true,
    define: configShim.define,
    loader: {
        ".svg": "dataurl",
        ".png": "file",
        ".mp3": "file",
        ".gif": "file",
    },
    assetNames: "[name]",
    external: externals,
    logLimit: 3,
    logLevel: "info",
    legalComments: "linked",
});

task.catch(() => process.exit(1));

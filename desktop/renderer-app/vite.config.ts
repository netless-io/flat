import refresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import path from "path";
import { dotenv } from "../../web/flat-web/scripts/vite-plugin-dotenv";
import { electron } from "./scripts/vite-plugin-electron";

export default defineConfig({
    plugins: [refresh(), dotenv("../../config"), electron()],
    resolve: {
        alias: [
            // replace webpack alias
            { find: /^~/, replacement: "" },
            {
                find: "flat-types",
                replacement: path.join(__dirname, "..", "..", "packages", "flat-types", "src"),
            },
            {
                find: "flat-i18n",
                replacement: path.join(__dirname, "..", "..", "packages", "flat-i18n", "locales"),
            },
            {
                find: "flat-components",
                replacement: path.join(__dirname, "..", "..", "packages", "flat-components", "src"),
            },
        ],
    },
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                format: "cjs",
            },
            external: [...electron.externals],
        },
    },
    clearScreen: false,
    optimizeDeps: {
        exclude: [...electron.externals, "fs-extra", "extract-zip"],
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                modifyVars: {
                    "primary-color": "#3381FF",
                    "link-color": "#3381FF",
                },
            },
        },
    },
});

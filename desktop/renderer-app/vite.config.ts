import legacy from "@vitejs/plugin-legacy";
import refresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import path from "path";
import { dotenv } from "../../web/flat-web/scripts/vite-plugin-dotenv";

export default defineConfig({
    plugins: [refresh(), legacy(), dotenv("../../config")],
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
    },
    clearScreen: false,
    optimizeDeps: {
        exclude: ["agora-electron-sdk"],
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

import refresh from "@vitejs/plugin-react-refresh";
import legacy from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";
import { dotenv } from "./scripts/vite-plugin-dotenv";

export default defineConfig({
    plugins: [refresh(), legacy(), dotenv("../../config")],
    resolve: {
        alias: [
            // replace webpack alias
            { find: /^~/, replacement: "" },
        ],
    },
});

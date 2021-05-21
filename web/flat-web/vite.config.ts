import refresh from "@vitejs/plugin-react-refresh";
import legacy from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [refresh(), legacy()],
});

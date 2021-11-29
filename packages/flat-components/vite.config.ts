import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig(({ mode }) => {
    const isProd = mode === "production";

    return {
        build: {
            lib: {
                entry: path.resolve(__dirname, "src/index.ts"),
                formats: ["es", "cjs"],
            },
            outDir: "dist",
            sourcemap: isProd,
            rollupOptions: {
                external: ["react"],
            },
            minify: isProd,
        },
    };
});

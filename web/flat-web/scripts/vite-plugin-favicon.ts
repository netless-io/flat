import type { Plugin } from "vite";

export function generateFavicon(): Plugin {
    return {
        name: "flat:generate-favicon",
        transformIndexHtml(html) {
            const region = process.env.FLAT_REGION || "CN";
            return html.replace(
                "%DYNAMIC_FAVICON%",
                region === "CN" ? "/favicon.ico" : "/favicon_en.ico",
            );
        },
    };
}

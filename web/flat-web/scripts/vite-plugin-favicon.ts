import type { Plugin } from "vite";

export function generateFavicon(): Plugin {
    function deleteLine(html: string, search: string): string {
        const lines = html.split("\n");
        const index = lines.findIndex(line => line.includes(search));
        if (index >= 0) {
            lines.splice(index, 1);
        }
        return lines.join("\n");
    }

    return {
        name: "flat:generate-favicon",
        transformIndexHtml(html) {
            const region = process.env.FLAT_REGION || "CN";
            if (region === "CN") {
                return deleteLine(html, 'type="image/x-icon" lang="en"');
            } else {
                return deleteLine(html, 'type="image/x-icon"'); // this matches the first line
            }
        },
    };
}

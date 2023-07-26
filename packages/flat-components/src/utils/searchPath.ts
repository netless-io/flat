// Get '?path={path}' from location.search, compatible with BrowserRouter and HashRouter.
export function searchPath(): string | null {
    if (typeof window.location !== "undefined") {
        const location = window.location;
        if (location.hash.startsWith("#/")) {
            const searchIndex = location.hash.indexOf("?");
            if (searchIndex > 0) {
                return new URLSearchParams(location.hash.slice(searchIndex)).get("path");
            }
        } else {
            return new URLSearchParams(location.search).get("path");
        }
    }
    return null;
}

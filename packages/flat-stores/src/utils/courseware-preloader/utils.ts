// TODO: split utils methods

class CacheBuilder {
    private cache: Promise<Cache> | undefined;

    public constructor(private cacheName: string) {}

    public build = (): Promise<Cache> => {
        return (this.cache ||= caches.open(this.cacheName));
    };
}

export const cachePPTConvert = new CacheBuilder("ppt-convert").build;

const contentTypeByExt: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".txt": "text/plain",
    ".json": "application/json",
    ".xml": "application/xml",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp3": "audio/mpeg",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
};

// it is guaranteed that the url does not follows '#' or '?'
export function contentType(url: string): string {
    const filename = url.substring(url.lastIndexOf("/"));
    const ext = filename.substring(filename.lastIndexOf("."));
    return contentTypeByExt[ext] || "text/plain";
}

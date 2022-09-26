export function validateURL(url: string): boolean {
    if (!url.startsWith("https://")) {
        return false;
    }
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

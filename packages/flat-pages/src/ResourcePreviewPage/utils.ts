export function getFileSuffix(path: string): string {
    return (/\.[a-z1-9]+$/i.exec(path) || [""])[0].toLowerCase();
}

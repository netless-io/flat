export function getFileExt(fileName: string): string {
    return (/\.([^.]+)$/.exec(fileName) || ["", ""])[1].toLowerCase();
}

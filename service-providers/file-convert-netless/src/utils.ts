export function getFileExt(fileName: string): string {
    return (/\.([^.]+)$/.exec(fileName) || ["", ""])[1].toLowerCase();
}

export function isPPTX(fileName: string): boolean {
    return fileName.endsWith(".pptx");
}

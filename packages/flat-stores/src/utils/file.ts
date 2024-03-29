/**
 * "name.txt" => "txt"
 */
export const getFileExt = (fileName: string): string =>
    (/\.([^.]+)$/.exec(fileName) || ["", ""])[1].toLowerCase();

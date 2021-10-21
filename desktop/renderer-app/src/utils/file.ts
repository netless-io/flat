/**
 * "name.txt" => "txt"
 */
export const getFileExt = (fileName: string): string =>
    (/\.([^.]+)$/.exec(fileName) || ["", ""])[1].toLowerCase();

export const isPPTX = (fileName: string): boolean => /\.pptx$/i.test(fileName);

import extract from "extract-zip";
import path from "path";

/**
 * unzip zip file
 * @param {string} filePath - zip file absolute path
 * @param {string} extractDir - unzip folder, default directory peer e.g :(test.zip -> test/)
 * @return {Promise<void>}
 */
export const extractZIP = (filePath: string, extractDir?: string): Promise<void> => {
    const dir = extractDir || path.join(path.dirname(filePath), path.basename(filePath, ".zip"));

    return extract(filePath, { dir });
};

import extract from "extract-zip";

/**
 * unzip zip file
 * @param {string} filePath - zip file absolute path
 * @param {string} extractDir - unzip folder, default directory peer e.g :(test.zip -> test/)
 * @return {Promise<void>}
 */
export const extractZIP = (filePath: string, extractDir?: string): Promise<void> => {
    const path = window.node.path;
    const dir = extractDir || path.join(path.dirname(filePath), path.basename(filePath, ".zip"));

    return extract(filePath, { dir });
};

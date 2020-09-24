import path from "path";
import { readdirSync, lstatSync, pathExistsSync } from "fs-extra";

/**
 * 列举目录下所有的文件以及文件夹
 * @param {string} p - 要列举的目录
 * @return string[]
 */
export const listDir = (p: string): string[] => {
    if (pathExistsSync(p)) {
        return readdirSync(p).map(fileName => path.join(p, fileName));
    }

    return [];
};

/**
 * 列举目录下所有的文件夹
 * @param {string} path - 要列举的目录
 * @return string[]
 */
export const listDirByDirectory = (path: string): string[] => {
    return listDir(path).filter(filePath => {
        return lstatSync(filePath).isDirectory();
    });
};

/**
 * 列举目录下所有的文件
 * @param {string} path - 要列举的目录
 * @return string[]
 */
export const listDirByFile = (path: string): string[] => {
    return listDir(path).filter(filePath => {
        return lstatSync(filePath).isFile();
    });
};

const fs = require("fs");
const path = require("path");
const { version } = require("../constants");
const {
    winBuildPath,
    macBuildPath,
    isBeta,
    winArtifactsRegExp,
    macArtifactsRegExp,
} = require("./constants");

if (!process.env.FLAT_REGION) {
    console.error("Please set env `FLAT_REGION` before running deployment");
    process.exit(1);
}

/**
 * file info list
 * @typedef {Array<{
 *     localPath: string,
 *     name: string,
 *     size: number,
 * }>} FileInfoList
 */

/**
 * get file path and file size in specify directory
 * @param {string} p - specify directory
 * @return {FileInfoList} file info list
 */
const getFilesAndSizeInDir = p => {
    const result = [];

    if (!fs.existsSync(p)) {
        return result;
    }

    fs.readdirSync(p).forEach(name => {
        const stat = fs.lstatSync(path.join(p, name));

        if (stat.isFile()) {
            result.push({
                localPath: path.join(p, name),
                name: name,
                size: stat.size,
            });
        }
    });

    return result;
};

/**
 * in the file list, get artifacts files
 * @param {RegExp[]} regex - match artifacts files regex list
 * @param {FileInfoList} fileList - list of files to be detected
 * @return {FileInfoList} artifacts files
 */
const getArtifactsFiles = (regex, fileList) => {
    for (const regx of regex) {
        if (fileList.some(file => regx.test(file.name))) continue;
        throw new Error(`Can't find a file that matches the ${regx} RegExp`);
    }
    return fileList.filter(file => regex.some(regx => regx.test(file.name)));
};

module.exports.winArtifactsFiles = getArtifactsFiles(
    winArtifactsRegExp,
    getFilesAndSizeInDir(winBuildPath(process.env.FLAT_REGION)),
);

module.exports.macArtifactsFiles = getArtifactsFiles(
    macArtifactsRegExp,
    getFilesAndSizeInDir(macBuildPath(process.env.FLAT_REGION)),
);

/**
 * set up different directories according to different files and platforms
 * @param {string} folder - bucket folder name
 * @param {"win" | "mac"} platform - platform to which the file belongs
 * @return {function} accept the file name and mode to match
 */
module.exports.uploadRule = (folder, platform) => {
    const prefix = mode => {
        if (mode === "backup") {
            return `v${version}/${platform}`;
        }

        if (isBeta) {
            return `latest/beta/${platform}`;
        }

        return `latest/stable/${platform}`;
    };
    /**
     * @param {string} filename - file name
     * @param {"effect" | "backup"} mode - origin: really used for upgrading, backup: for backup
     * @return {string} finally object name (oss / s3 file path)
     */
    return (filename, mode) => {
        return `${folder}/${prefix(mode)}/${filename}`;
    };
};

/**
 * array chunk
 * @param {Array<any>} array - origin array
 * @param {number} chunk_size - chunk number
 * @return {Array<any>[]}
 */
module.exports.arrayChunks = (array, chunk_size) => {
    return Array(Math.ceil(array.length / chunk_size))
        .fill()
        .map((_, index) => index * chunk_size)
        .map(begin => array.slice(begin, begin + chunk_size));
};

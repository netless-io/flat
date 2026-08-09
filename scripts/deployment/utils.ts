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

type FileInfo = {
    localPath: string;
    name: string;
    size: number;
};

type FileInfoList = FileInfo[];

const getFilesAndSizeInDir = (p: string): FileInfoList => {
    const result: FileInfoList = [];

    if (!fs.existsSync(p)) {
        return result;
    }

    fs.readdirSync(p).forEach((name: string) => {
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

const getArtifactsFiles = (regex: RegExp[], fileList: FileInfoList): FileInfoList => {
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

module.exports.uploadRule = (folder: string, platform: "win" | "mac") => {
    const prefix = (mode: "backup" | "effect"): string => {
        if (mode === "backup") {
            return `v${version}/${platform}`;
        }

        if (isBeta) {
            return `latest/beta/${platform}`;
        }

        return `latest/stable/${platform}`;
    };
    return (filename: string, mode: "effect" | "backup"): string => {
        return `${folder}/${prefix(mode)}/${filename}`;
    };
};

const arrayChunks = <T>(array: T[], chunk_size: number): T[][] => {
    return Array(Math.ceil(array.length / chunk_size))
        .fill(null)
        .map((_, index) => index * chunk_size)
        .map(begin => array.slice(begin, begin + chunk_size));
};
module.exports.arrayChunks = arrayChunks;
export {};

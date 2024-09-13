const os = require("os");
const OSS = require("ali-oss");
const readline = require("readline");
const { winArtifactsFiles, macArtifactsFiles, uploadRule, arrayChunks } = require("./utils");
const { autoChooseConfig } = require("../utils/auto-choose-config");

require("dotenv-flow").config({
    node_env: "production",
    path: autoChooseConfig(),
    silent: true,
});

console.log(`
will upload file list:
${JSON.stringify([...winArtifactsFiles, ...macArtifactsFiles], null, 2)}

FLAT_REGION = ${process.env.FLAT_REGION}

will upload to OSS:
BUCKET = ${process.env.ARTIFACTS_ALIBABA_CLOUD_OSS_BUCKET}
REGION = ${process.env.ARTIFACTS_ALIBABA_CLOUD_OSS_REGION}
`);

const client = new OSS({
    bucket: process.env.ARTIFACTS_ALIBABA_CLOUD_OSS_BUCKET,
    region: process.env.ARTIFACTS_ALIBABA_CLOUD_OSS_REGION,
    accessKeyId: process.env.ARTIFACTS_ALIBABA_CLOUD_OSS_ACCESS_KEY,
    accessKeySecret: process.env.ARTIFACTS_ALIBABA_CLOUD_OSS_ACCESS_KEY_SECRET,
    secure: true,
    retryMax: 2,
});

(async () => {
    const repl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "",
    });
    repl.on("SIGINT", () => {
        repl && repl.close();
    });
    const answer = await new Promise(resolve => {
        repl.question(`is that ok? (y/N) `, a => resolve(a || "N"));
    });
    if (answer[0].toLowerCase() !== "y") {
        console.log("ok i give up.");
        process.exit(0);
    }

    const winUploadRule = uploadRule(process.env.ARTIFACTS_ALIBABA_CLOUD_OSS_FOLDER, "win");
    const macUploadRule = uploadRule(process.env.ARTIFACTS_ALIBABA_CLOUD_OSS_FOLDER, "mac");

    const objectInfo = [
        ...winArtifactsFiles.map(fileInfo => {
            return {
                ...fileInfo,
                backupPath: winUploadRule(fileInfo.name, "backup"),
                effectPath: winUploadRule(fileInfo.name, "effect"),
            };
        }),
        ...macArtifactsFiles.map(fileInfo => {
            return {
                ...fileInfo,
                backupPath: macUploadRule(fileInfo.name, "backup"),
                effectPath: macUploadRule(fileInfo.name, "effect"),
            };
        }),
    ];

    console.log(
        os.EOL,
        "==========================START UPLOAD BACKUP FILE===========================",
        os.EOL,
    );

    // ali oss will modify option, cause the upload file type to be incorrect
    // so change the variable to a function
    // see: https://github.com/ali-sdk/ali-oss/blob/d3583e8460a062a28e12bd719a1929ea659c1c5e/lib/browser/object.js#L69
    const generalAlibabaCloudOSSOptions = () => ({
        timeout: 1000 * 60 * 3,
    });

    const uploadBackupFile = objectInfo.map(({ backupPath, localPath, size }) => {
        const uploadCompleteLog = () => {
            console.log(`upload backup file complete: ${backupPath}`);
        };

        return () => {
            console.log(`start upload backup file: ${backupPath}`);

            // use multipart upload when more then 80M
            if (size >= 80 * 1000 * 1024) {
                return client
                    .multipartUpload(backupPath, localPath, generalAlibabaCloudOSSOptions())
                    .then(uploadCompleteLog);
            } else {
                return client
                    .put(backupPath, localPath, generalAlibabaCloudOSSOptions())
                    .then(uploadCompleteLog);
            }
        };
    });

    {
        const uploadTaskChunk = arrayChunks(uploadBackupFile, 3);
        for (const tasks of uploadTaskChunk) {
            await Promise.all(tasks.map(task => task()));
        }
    }

    console.log(
        os.EOL,
        "==========================START UPLOAD EFFECT FILE===========================",
        os.EOL,
    );

    const uploadEffectFile = objectInfo.map(({ backupPath, effectPath }) => {
        console.log(`start upload effect file: ${effectPath}`);

        const uploadCompleteLog = () => {
            console.log(`upload effect file complete: ${effectPath}`);
        };

        // because we used useMultipleRangeRequest: false
        // so, we don't need to set a header of mime-type: multipart/byteranges for *.blockmap
        // see: https://github.com/electron-userland/electron-builder/blob/28cb86bdcb6dd0b10e75a69ccd34ece6cca1d204/packages/electron-updater/src/differentialDownloader/DifferentialDownloader.ts#L188
        return client
            .copy(
                effectPath,
                backupPath,
                process.env.ARTIFACTS_ALIBABA_CLOUD_OSS_BUCKET,
                generalAlibabaCloudOSSOptions,
            )
            .then(uploadCompleteLog);
    });

    await Promise.all(uploadEffectFile);
    process.exit(0);
})();

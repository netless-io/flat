const os = require("os");
const OSS = require("ali-oss");
const { configPath } = require("./constants");
const { winArtifactsFiles, macArtifactsFiles, uploadRule, arrayChunks } = require("./utils");

require("dotenv-flow").config({
    node_env: "production",
    path: configPath,
    silent: true,
});

console.log(`
will upload file list:
${JSON.stringify([...winArtifactsFiles, ...macArtifactsFiles], null, 2)}
`);

const client = new OSS({
    bucket: process.env.ALIBABA_CLOUD_OSS_BUCKET,
    region: process.env.ALIBABA_CLOUD_OSS_REGION,
    accessKeyId: process.env.ALIBABA_CLOUD_OSS_ACCESS_KEY,
    accessKeySecret: process.env.ALIBABA_CLOUD_OSS_ACCESS_KEY_SECRET,
    secure: true,
    retryMax: 2,
});

(async () => {
    const winUploadRule = uploadRule(process.env.ALIBABA_CLOUD_OSS_FOLDER, "win");
    const macUploadRule = uploadRule(process.env.ALIBABA_CLOUD_OSS_FOLDER, "mac");

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

    const uploadBackupFile = objectInfo.map(({ backupPath, localPath, size }) => {
        const uploadCompleteLog = () => {
            console.log(`upload backup file complete: ${backupPath}`);
        };

        return () => {
            console.log(`start upload backup file: ${backupPath}`);

            // use multipart upload when more then 80M
            if (size >= 80 * 1000 * 1024) {
                return client
                    .multipartUpload(backupPath, localPath, {
                        timeout: 1000 * 60 * 2,
                    })
                    .then(uploadCompleteLog);
            } else {
                return client
                    .put(backupPath, localPath, {
                        timeout: 1000 * 60 * 2,
                    })
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

        return client
            .copy(effectPath, backupPath, process.env.ALIBABA_CLOUD_OSS_BUCKET, {
                timeout: 1000 * 60 * 2,
            })
            .then(uploadCompleteLog);
    });

    await Promise.all(uploadEffectFile);
})();

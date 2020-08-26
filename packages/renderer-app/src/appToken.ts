export const netlessToken = {
    sdkToken: process.env.NETLESS_SDK_TOKEN,
    appIdentifier: process.env.NETLESS_APP_IDENTIFIER,
};

export type OSSConfigObjType = {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    bucket: string;
    folder: string;
    prefix: string;
};
export const ossConfigObj: OSSConfigObjType = {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    region: process.env.OSS_REGION,
    bucket: process.env.OSS_BUCKET,
    folder: process.env.OSS_FOLDER,
    prefix: process.env.OSS_PREFIX,
};

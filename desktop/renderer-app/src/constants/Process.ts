export const NODE_ENV = process.env.NODE_ENV;

export const NETLESS = Object.freeze({
    SDK_TOKEN: process.env.NETLESS_SDK_TOKEN,
    APP_IDENTIFIER: process.env.NETLESS_APP_IDENTIFIER,
});

export const OSS_CONFIG = Object.freeze({
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    region: process.env.OSS_REGION,
    bucket: process.env.OSS_BUCKET,
    folder: process.env.OSS_FOLDER,
    prefix: process.env.OSS_PREFIX,
});

export const AGORA = Object.freeze({
    APP_ID: process.env.AGORA_APP_ID,
});

export const WECHAT = Object.freeze({
    APP_ID: process.env.WECHAT_APP_ID,
});

export const FLAT_SERVER_DOMAIN = process.env.FLAT_SERVER_DOMAIN;

export const NODE_ENV = process.env.NODE_ENV;

export const NETLESS = Object.freeze({
    APP_IDENTIFIER: process.env.NETLESS_APP_IDENTIFIER,
});

export const CLOUD_STORAGE_OSS_ALIBABA_CONFIG = Object.freeze({
    accessKey: process.env.CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY,
    bucket: process.env.CLOUD_STORAGE_OSS_ALIBABA_BUCKET,
    region: process.env.CLOUD_STORAGE_OSS_ALIBABA_REGION,
});

export const AGORA = Object.freeze({
    APP_ID: process.env.AGORA_APP_ID,
});

export const WECHAT = Object.freeze({
    APP_ID: process.env.WECHAT_APP_ID,
});

export const FLAT_SERVER_DOMAIN = process.env.FLAT_SERVER_DOMAIN;

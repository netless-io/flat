export const NODE_ENV = process.env.NODE_ENV;

export const NETLESS = Object.freeze({
    APP_IDENTIFIER: process.env.NETLESS_APP_IDENTIFIER,
});

export const CLOUD_STORAGE_OSS_ALIBABA_CONFIG = Object.freeze({
    accessKey: process.env.CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY,
    bucket: process.env.CLOUD_STORAGE_OSS_ALIBABA_BUCKET,
    region: process.env.CLOUD_STORAGE_OSS_ALIBABA_REGION,
});

export const CLOUD_STORAGE_DOMAIN = process.env.CLOUD_STORAGE_DOMAIN;

export const AGORA = Object.freeze({
    APP_ID: process.env.AGORA_APP_ID,
});

export const WECHAT = Object.freeze({
    APP_ID: process.env.WECHAT_APP_ID,
});

export const GITHUB = Object.freeze({
    CLIENT_ID: process.env.GITHUB_CLIENT_ID,
});

export const FLAT_SERVER_DOMAIN = process.env.FLAT_SERVER_DOMAIN;
export const FLAT_WEB_DOMAIN = process.env.FLAT_WEB_DOMAIN;

export const FLAT_DOWNLOAD_URL = process.env.FLAT_DOWNLOAD_URL;

export const FLAT_WEB_BASE_URL = `https://${FLAT_WEB_DOMAIN}`;

export const PRIVACY_URL_CN = "https://flat.whiteboard.agora.io/privacy.html";
export const PRIVACY_URL = "https://flat.whiteboard.agora.io/privacy.html";

export const SERVICE_URL_CN = "https://flat.whiteboard.agora.io/service.html";
export const SERVICE_URL = "https://flat.whiteboard.agora.io/service.html";

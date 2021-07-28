export const NODE_ENV = import.meta.env.MODE;

export const NETLESS = Object.freeze({
    APP_IDENTIFIER: import.meta.env.NETLESS_APP_IDENTIFIER,
});

export const CLOUD_STORAGE_OSS_ALIBABA_CONFIG = Object.freeze({
    accessKey: import.meta.env.CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY,
    bucket: import.meta.env.CLOUD_STORAGE_OSS_ALIBABA_BUCKET,
    region: import.meta.env.CLOUD_STORAGE_OSS_ALIBABA_REGION,
});

export const AGORA = Object.freeze({
    APP_ID: import.meta.env.AGORA_APP_ID,
});

export const WECHAT = Object.freeze({
    APP_ID: import.meta.env.WECHAT_APP_ID,
});

export const GITHUB = Object.freeze({
    CLIENT_ID: import.meta.env.GITHUB_CLIENT_ID,
});

export const FLAT_SERVER_DOMAIN = import.meta.env.FLAT_SERVER_DOMAIN;
export const FLAT_WEB_DOMAIN = import.meta.env.FLAT_WEB_DOMAIN;

export const INVITE_BASEURL = `https://${FLAT_WEB_DOMAIN}`;

// TODO: english version is WIP
export const PRIVACY_URL_CN = "https://flat.whiteboard.agora.io/privacy.html";
export const PRIVACY_URL = "https://flat.whiteboard.agora.io/privacy.html";

export const SERVICE_URL_CN = "https://flat.whiteboard.agora.io/service.html";
export const SERVICE_URL = "https://flat.whiteboard.agora.io/service.html";

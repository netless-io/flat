interface Window {
    rtcEngine: any;
}

declare namespace NodeJS {
    export interface ProcessEnv {
        NODE_ENV: "development" | "production";
        DEV: boolean;
        PROD: boolean;

        NETLESS_APP_IDENTIFIER: string;

        CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY: string;
        CLOUD_STORAGE_OSS_ALIBABA_BUCKET: string;
        CLOUD_STORAGE_OSS_ALIBABA_REGION: string;

        CLOUD_STORAGE_DOMAIN: string;

        AGORA_APP_ID: string;

        GITHUB_CLIENT_ID: string;

        WECHAT_APP_ID: string;
        FLAT_SERVER_DOMAIN: string;
        FLAT_WEB_DOMAIN: string;

        FLAT_DOWNLOAD_URL: string;

        CLOUD_RECORDING_DEFAULT_AVATAR?: string;
    }
}

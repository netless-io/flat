declare namespace NodeJS {
    export interface ProcessEnv {
        NODE_ENV: "development" | "production";
        DEV: boolean;
        PROD: boolean;
        VERSION: string;

        NETLESS_APP_IDENTIFIER: string;

        AGORA_APP_ID: string;

        AGORA_OAUTH_CLIENT_ID: string;

        GITHUB_CLIENT_ID: string;
        GOOGLE_OAUTH_CLIENT_ID: string;

        WECHAT_APP_ID: string;
        FLAT_SERVER_DOMAIN: string;
        FLAT_WEB_DOMAIN: string;

        FLAT_DOWNLOAD_URL: string;
        FEEDBACK_URL: string;

        CLOUD_RECORDING_DEFAULT_AVATAR?: string;

        LOGIN_METHODS: string;
    }
}

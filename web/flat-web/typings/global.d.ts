declare namespace NodeJS {
    export interface ProcessEnv {
        NODE_ENV: "development" | "production";
        DEV: boolean;
        PROD: boolean;
        VERSION: string;

        FLAT_SERVER_DOMAIN: string;
        FLAT_WEB_DOMAIN: string;

        FLAT_DOWNLOAD_URL: string;
        FEEDBACK_URL: string;

        CLOUD_RECORDING_DEFAULT_AVATAR?: string;
        LOGIN_METHODS: string;
    }
}

declare interface Window {
    __netlessUA?: string;
    isElectron?: boolean;

    node?: any;
}

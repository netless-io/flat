declare module "*.svg" {
    // eslint-disable-next-line no-undef
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}

declare module "*.mp3";

declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production";
        NETLESS_SDK_TOKEN: string;
        NETLESS_APP_IDENTIFIER: string;

        CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY: string;
        CLOUD_STORAGE_OSS_ALIBABA_BUCKET: string;
        CLOUD_STORAGE_OSS_ALIBABA_REGION: string;

        AGORA_APP_ID: string;

        WECHAT_APP_ID: string;
        FLAT_SERVER_DOMAIN: string;
    }
}

interface Window {
    rtcEngine: any;
}

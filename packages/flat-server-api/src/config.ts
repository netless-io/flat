import { getV2NotAuth } from "./utils";

export type ServerRegionConfigResult = {
    hash: string;
    login: {
        wechatWeb: boolean;
        wechatMobile: boolean;
        github: boolean;
        google: boolean;
        apple: boolean;
        agora: boolean;
        sms: boolean;
        smsForce: boolean;
    };
    server: {
        region: string;
        regionCode: number;
        env: string;
        /** in minutes */
        joinEarly: number;
    };
    whiteboard: {
        appId: string;
        convertRegion: string;
    };
    agora: {
        clientId: string;
        appId: string;
        screenshot: boolean;
        messageNotification: boolean;
    };
    github: {
        clientId: string;
    };
    wechat: {
        webAppId: string;
        mobileAppId: string;
    };
    google: {
        clientId: string;
    };
    cloudStorage: {
        singleFileSize: number;
        totalSize: number;
        allowFileSuffix: String[];
        accessKey: string;
    };
    censorship: {
        video: boolean;
        voice: boolean;
        text: boolean;
    };
};

export async function getServerRegionConfigs(): Promise<ServerRegionConfigResult> {
    return await getV2NotAuth<ServerRegionConfigResult>("region/configs");
}

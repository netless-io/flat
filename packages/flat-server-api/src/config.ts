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
    };
    whiteboard: {
        convertRegion: string;
    };
    agora: {
        screenshot: boolean;
        messageNotification: boolean;
    };
    cloudStorage: {
        singleFileSize: number;
        totalSize: number;
        allowFileSuffix: String[];
    };
    censorship: {
        video: boolean;
        voice: boolean;
        text: boolean;
    };
};

export async function getServerRegionConfig(): Promise<ServerRegionConfigResult> {
    return await getV2NotAuth<ServerRegionConfigResult>("region/configs");
}

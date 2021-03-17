import { WechatInfo } from "../../stores/GlobalStore";

export function getWechatInfo(): WechatInfo | null {
    const wechatInfo = localStorage.getItem("wechatInfo");
    return wechatInfo ? JSON.parse(wechatInfo) : null;
}

export function setWechatInfo(config: WechatInfo): WechatInfo {
    localStorage.setItem("wechatInfo", JSON.stringify(config));
    return config;
}

export function getUserUuid(): string | null {
    return localStorage.getItem("userUUID");
}

export function setUserUuid(userUUID: string): string {
    localStorage.setItem("userUUID", userUUID);
    return userUUID;
}

export interface LSWechatInfo {
    userUUID: string;
    avatar: string;
    name: string;
    token: string;
}

export function getWechatInfo(): LSWechatInfo | null {
    const wechatInfo = localStorage.getItem("wechatInfo");
    return wechatInfo ? JSON.parse(wechatInfo) : null;
}

export function setWechatInfo(config: LSWechatInfo): LSWechatInfo {
    localStorage.setItem("wechatInfo", JSON.stringify(config));
    return config;
}

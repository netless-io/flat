export interface LSWechatInfo {
    avatar: string;
    name: string;
    token: string;
}

export type LSWechatUserUuid = string;

export function getWechatInfo(): LSWechatInfo | null {
    const wechatInfo = localStorage.getItem("wechatInfo");
    return wechatInfo ? JSON.parse(wechatInfo) : null;
}

export function setWechatInfo(config: LSWechatInfo): LSWechatInfo {
    localStorage.setItem("wechatInfo", JSON.stringify(config));
    return config;
}

export function getUserUuid(): LSWechatUserUuid | null {
    return localStorage.getItem("userUUID");
}

export function setUserUuid(userUUID: LSWechatUserUuid): LSWechatUserUuid {
    localStorage.setItem("userUUID", userUUID);
    return userUUID;
}

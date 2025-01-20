export const FLAT_REGION = process.env.FLAT_REGION;

// { CN: '...', SG: '...' }
export const SERVER_DOMAINS = process.env.FLAT_SERVER_DOMAINS as unknown as Record<string, string>;

export const CURRENT_SERVER_DOMAIN = process.env.FLAT_SERVER_DOMAIN;
export const FLAT_AGREEMENT_URL = process.env.FLAT_AGREEMENT_URL;

export const COOKIE_DOMAIN = CURRENT_SERVER_DOMAIN
    ? CURRENT_SERVER_DOMAIN.slice(CURRENT_SERVER_DOMAIN.indexOf(".") + 1)
    : "";

export const FLAT_SERVER_BASE_URL = `https://${CURRENT_SERVER_DOMAIN}`;

export const FLAT_SERVER_BASE_URL_V1 = `https://${CURRENT_SERVER_DOMAIN}/v1`;
export const FLAT_SERVER_BASE_URL_V2 = `https://${CURRENT_SERVER_DOMAIN}/v2`;

export const FLAT_SERVER_LOGIN = {
    AGORA_CALLBACK: `https://${CURRENT_SERVER_DOMAIN}/v1/login/agora/callback`,
    GITHUB_CALLBACK: `https://${CURRENT_SERVER_DOMAIN}/v1/login/github/callback?platform=web`,
    GOOGLE_CALLBACK: `https://${CURRENT_SERVER_DOMAIN}/v1/login/google/callback`,
    WECHAT_CALLBACK: `https://${CURRENT_SERVER_DOMAIN}/v1/login/weChat/web/callback`,
} as const;

export const FLAT_SERVER_USER_BINDING = {
    GITHUB_CALLBACK: `https://${CURRENT_SERVER_DOMAIN}/v1/login/github/callback/binding`,
    WECHAT_CALLBACK: `https://${CURRENT_SERVER_DOMAIN}/v1/user/binding/platform/wechat/web`,
    GOOGLE_CALLBACK: `https://${CURRENT_SERVER_DOMAIN}/v1/user/binding/platform/google`,
} as const;

export enum Region {
    CN_HZ = "cn-hz",
    US_SV = "us-sv",
    SG = "sg",
    IN_MUM = "in-mum",
    GB_LON = "gb-lon",
}

export enum RoomType {
    OneToOne = "OneToOne",
    SmallClass = "SmallClass",
    BigClass = "BigClass",
}

export enum Week {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}

export enum RoomStatus {
    Idle = "Idle",
    Started = "Started",
    Paused = "Paused",
    Stopped = "Stopped",
}

export enum Status {
    NoLogin = -1,
    Success,
    Failed,
    Process,
    AuthFailed,
}

export enum FileConvertStep {
    None = "None",
    Converting = "Converting",
    Done = "Done",
    Failed = "Failed",
}

export type AIRole = "lily" | "peppa" | "spongebob" | "sillybear" | "ironman" | "LuoTianYi";

export type AIScene =
    | "TakingOrders"
    | "Shopping"
    | "HotelBooking"
    | "SelfIntroduction"
    | "Interview"
    | "ChatWithFriends"
    | "";
export type AILanguage = "zh" | "en";

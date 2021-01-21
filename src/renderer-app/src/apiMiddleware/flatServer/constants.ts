import { FLAT_SERVER_DOMAIN } from "../../constants/Process";

export const FLAT_SERVER_PROTOCOL = {
    HTTPS: `https://${FLAT_SERVER_DOMAIN}`,
    WSS: `wss://${FLAT_SERVER_DOMAIN}`,
} as const;

export const FLAT_SERVER_VERSIONS = {
    V1HTTPS: `${FLAT_SERVER_PROTOCOL.HTTPS}/v1`,
    V1WSS: `${FLAT_SERVER_PROTOCOL.WSS}/v1`,
} as const;

export const FLAT_SERVER_LOGIN = {
    WSS_LOGIN: `${FLAT_SERVER_VERSIONS.V1WSS}/Login`,
    WECHAT_CALLBACK: `${FLAT_SERVER_VERSIONS.V1HTTPS}/login/weChat/callback`,
    HTTPS_LOGIN: `${FLAT_SERVER_VERSIONS.V1HTTPS}/login`,
} as const;

export enum RoomType {
    OneToOne = "OneToOne",
    SmallClass = "SmallClass",
    BigClass = "BigClass",
}

export enum DocsType {
    Dynamic = "Dynamic",
    Static = "Static",
}

export interface RoomDoc {
    docType: DocsType;
    docUUID: string;
    isPreload: boolean;
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

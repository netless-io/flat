import { FLAT_SERVER_DOMAIN } from "../../constants/Process";

const FLAT_SERVER_PROTOCOL = `https://${FLAT_SERVER_DOMAIN}`;

export const FLAT_SERVER_VERSIONS = {
    V1: `${FLAT_SERVER_PROTOCOL}/v1`,
} as const;

export const FLAT_SERVER_LOGIN = {
    GITHUB_CALLBACK: `${FLAT_SERVER_VERSIONS.V1}/login/github/callback?platform=web`,
    WECHAT_CALLBACK: `${FLAT_SERVER_VERSIONS.V1}/login/weChat/web/callback`,
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

/** 课件 */
export interface RoomDoc {
    /**文档的 uuid */
    docUUID: string;
    /**文档类型 */
    docType: DocsType;
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

export enum Sex {
    Man = "Man",
    Woman = "Woman",
}

export enum FileConvertStep {
    None = "None",
    Converting = "Converting",
    Done = "Done",
    Failed = "Failed",
}

export type RoomInfo = {
    /** 普通房间或周期性房间子房间的 uuid */
    roomUUID: string;
    /** 房间所有者的 uuid */
    ownerUUID: string;
    /** 房间邀请码 */
    inviteCode?: string;
    /** 房间类型 */
    roomType?: RoomType;
    /** 子房间隶属的周期性房间 uuid */
    periodicUUID?: string;
    /** 房间所有者的名称 */
    ownerUserName?: string;
    /** 房间标题 */
    title?: string;
    /** 房间状态 */
    roomStatus?: RoomStatus;
    /** 房间开始时间 */
    beginTime?: number;
    /** 结束时间 */
    endTime?: number;
    /** 上一节课的开始时间 */
    previousPeriodicRoomBeginTime?: number;
    /** 下一节课的结束时间 */
    nextPeriodicRoomEndTime?: number;
    /** 当前周期性房间下一共有多少节课 */
    count?: number;
    /** 课件 */
    docs?: RoomDoc[];
    /** 是否存在录制(只有历史记录才会有) */
    hasRecord?: boolean;
    /** 录制记录 */
    recordings?: Array<{
        beginTime: number;
        endTime: number;
        videoURL?: string;
    }>;
};

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
    /** 文档的 uuid */
    docUUID: string;
    /** 文档类型 */
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

export type PeriodicEndType = "rate" | "time";

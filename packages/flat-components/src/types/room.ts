export type RoomInfo = {
    roomUUID: string;
    ownerUUID: string;
    inviteCode?: string;
    roomType?: RoomType;
    periodicUUID?: string;
    ownerUserName?: string;
    title?: string;
    roomStatus?: RoomStatus;
    beginTime?: number;
    endTime?: number;
    previousPeriodicRoomBeginTime?: number;
    nextPeriodicRoomEndTime?: number;
    /** total of room in periodic room */
    count?: number;
    hasRecord?: boolean;
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

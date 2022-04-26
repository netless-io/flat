import { RoomType, Region } from "./constants";
import { post } from "./utils";

export interface StartRecordRoomPayload {
    roomUUID: string;
}

export type StartRecordRoomResult = {};

export function startRecordRoom(roomUUID: string): Promise<StartRecordRoomResult> {
    return post<StartRecordRoomPayload, StartRecordRoomResult>("room/record/started", {
        roomUUID,
    });
}

export interface StopRecordRoomPayload {
    roomUUID: string;
}

export type StopRecordRoomResult = {};

export function stopRecordRoom(roomUUID: string): Promise<StopRecordRoomResult> {
    return post<StopRecordRoomPayload, StopRecordRoomResult>("room/record/stopped", {
        roomUUID,
    });
}

export interface UpdateRecordEndTimePayload {
    roomUUID: string;
}

export type UpdateRecordEndTimeResult = {};

export function updateRecordEndTime(roomUUID: string): Promise<UpdateRecordEndTimeResult> {
    return post<UpdateRecordEndTimePayload, UpdateRecordEndTimeResult>(
        "room/record/update-end-time",
        {
            roomUUID,
        },
    );
}

export interface RecordInfoPayload {
    roomUUID: string;
}

export interface RecordInfoResult {
    title: string;
    ownerUUID: string;
    roomType: RoomType;
    whiteboardRoomToken: string;
    whiteboardRoomUUID: string;
    region: Region;
    rtmToken: string;
    recordInfo: Array<{
        beginTime: number;
        endTime: number;
        videoURL?: string;
    }>;
}

export function recordInfo(roomUUID: string): Promise<RecordInfoResult> {
    return post<RecordInfoPayload, RecordInfoResult>("room/record/info", { roomUUID });
}

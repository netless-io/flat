import { Region } from "flat-components";
import { DocsType, RoomDoc, RoomStatus, RoomType, Sex, Week } from "./constants";
import { post, postNotAuth } from "./utils";

export interface CreateOrdinaryRoomPayload {
    /** 房间主题, 最多 50 字 */
    title: string;
    /** 上课类型 */
    type: RoomType;
    /** 区域 */
    region: Region;
    /** UTC时间戳 */
    beginTime: number;
    /** 如果不传，则默认是 beginTime 后的一个小时 */
    endTime?: number;
    /**课件 */
    docs?: Array<{
        /**文档类型 */
        type: DocsType;
        /**文档的 uuid */
        uuid: string;
    }>;
}

export interface CreateOrdinaryRoomResult {
    roomUUID: string;
}

export async function createOrdinaryRoom(payload: CreateOrdinaryRoomPayload): Promise<string> {
    const res = await post<CreateOrdinaryRoomPayload, CreateOrdinaryRoomResult>(
        "room/create/ordinary",
        payload,
    );
    return res.roomUUID;
}

export interface CreatePeriodicRoomPayload {
    /** 房间主题, 最多 50 字 */
    title: string;
    /** 上课类型 */
    type: RoomType;
    /** 区域 */
    region: Region;
    /** UTC时间戳 */
    beginTime: number;
    endTime: number;
    /** 重复 */
    periodic:
        | {
              /**重复周期, 每周的周几 */
              weeks: Week[];
              /** 重复几次就结束, -1..50 */
              rate: number;
          }
        | {
              weeks: Week[];
              /** UTC时间戳, 到这个点就结束 */
              endTime: number;
          };
    /**课件 */
    docs?: Array<{
        /**文档类型 */
        type: DocsType;
        /**文档的 uuid */
        uuid: string;
    }>;
}

export type CreatePeriodicRoomResult = {};

export async function createPeriodicRoom(payload: CreatePeriodicRoomPayload): Promise<void> {
    await post<CreatePeriodicRoomPayload, CreatePeriodicRoomResult>(
        "room/create/periodic",
        payload,
    );
}

export enum ListRoomsType {
    All = "all",
    Today = "today",
    Periodic = "periodic",
    History = "history",
}

export interface FlatServerRoom {
    /** 房间的 uuid */
    roomUUID: string;
    /** 周期性房间的 uuid */
    periodicUUID: string | null;
    /** 房间所有者的 uuid */
    ownerUUID: string;
    /** 房间类型  */
    roomType: RoomType;
    /** 房间所有者的名称 */
    ownerUserName: string;
    /** 房间标题 */
    title: string;
    /** 房间开始时间 */
    beginTime: number;
    /** 结束时间 */
    endTime: number;
    /** 房间状态 */
    roomStatus: RoomStatus;
    /** 是否存在录制(只有历史记录才会有) */
    hasRecord?: boolean;
}

export type ListRoomsPayload = {
    page: number;
};

export type ListRoomsResult = FlatServerRoom[];

export function listRooms(
    type: ListRoomsType,
    payload: ListRoomsPayload,
): Promise<ListRoomsResult> {
    return post<undefined, ListRoomsResult>(`room/list/${type}`, undefined, payload);
}

export interface JoinRoomPayload {
    uuid: string;
}

export interface JoinRoomResult {
    roomType: RoomType; // 房间类型
    roomUUID: string; // 当前房间的 UUID
    ownerUUID: string; // 房间创建者的 UUID
    whiteboardRoomToken: string; // 白板的 room token
    whiteboardRoomUUID: string; // 白板的 room uuid
    rtcUID: number; // rtc 的 uid
    rtcToken: string; // rtc token
    rtmToken: string; // rtm token
}

export function joinRoom(uuid: string): Promise<JoinRoomResult> {
    return post<JoinRoomPayload, JoinRoomResult>("room/join", { uuid });
}

export interface UsersInfoPayload {
    roomUUID: string;
    usersUUID: string[]; // 要参看的用户 uuid 列表
}

export type UsersInfoResult = {
    [key in string]: {
        name: string;
        rtcUID: number;
        avatarURL: string;
    };
};

export function usersInfo(payload: UsersInfoPayload): Promise<UsersInfoResult> {
    return post<UsersInfoPayload, UsersInfoResult>("room/info/users", payload);
}

export interface OrdinaryRoomInfo {
    title: string;
    beginTime: number;
    endTime: number;
    roomType: RoomType;
    roomStatus: RoomStatus;
    ownerUUID: string;
    ownerUserName: string;
    region: Region;
}

export interface OrdinaryRoomInfoPayload {
    roomUUID: string;
}

export interface OrdinaryRoomInfoResult {
    roomInfo: OrdinaryRoomInfo;
    docs: RoomDoc[];
}

export function ordinaryRoomInfo(roomUUID: string): Promise<OrdinaryRoomInfoResult> {
    return post<OrdinaryRoomInfoPayload, OrdinaryRoomInfoResult>("room/info/ordinary", {
        roomUUID,
    });
}

export interface PeriodicSubRoomInfoPayload {
    periodicUUID: string;
    roomUUID: string;
    /** 是否需要上一节课和下一节课的相关时间(只对owner起作用 */
    needOtherRoomTimeInfo?: boolean;
}

export interface PeriodicSubRoomInfo {
    title: string;
    beginTime: number;
    endTime: number;
    roomType: RoomType;
    roomStatus: RoomStatus;
    ownerUUID: string;
    ownerUserName: string;
    region: Region;
}

export interface PeriodicSubRoomInfoResult {
    roomInfo: PeriodicSubRoomInfo;
    previousPeriodicRoomBeginTime: number | null; // 上一节课的开始时间
    nextPeriodicRoomEndTime: number | null; // 下一节课的结束时间
    count: number; // 当前周期性房间下一共有多少节课
    docs: RoomDoc[];
}

export function periodicSubRoomInfo(
    payload: PeriodicSubRoomInfoPayload,
): Promise<PeriodicSubRoomInfoResult> {
    return post<PeriodicSubRoomInfoPayload, PeriodicSubRoomInfoResult>(
        "room/info/periodic-sub-room",
        payload,
    );
}

export interface PeriodicRoomInfoPayload {
    periodicUUID: string;
}

export type PeriodicRoomInfoResult = {
    periodic: {
        ownerUUID: string; // 创建者的 uuid
        ownerUserName: string;
        endTime: number;
        rate: number | null; // 默认为 0（即 用户选择的是 endTime）
        title: string;
        weeks: Week[];
        roomType: RoomType;
        region: Region;
    };
    rooms: Array<{
        roomUUID: string;
        beginTime: number;
        endTime: number;
        roomStatus: RoomStatus;
    }>;
};

export function periodicRoomInfo(periodicUUID: string): Promise<PeriodicRoomInfoResult> {
    return post<PeriodicRoomInfoPayload, PeriodicRoomInfoResult>("room/info/periodic", {
        periodicUUID,
    });
}

export interface StartClassPayload {
    roomUUID: string;
}

export type StartClassResult = {};

export function startClass(roomUUID: string): Promise<StartClassResult> {
    return post<StartClassPayload, StartClassResult>("room/update-status/started", { roomUUID });
}

export interface PauseClassPayload {
    roomUUID: string;
}

export type PauseClassResult = {};

export function pauseClass(roomUUID: string): Promise<PauseClassResult> {
    return post<PauseClassPayload, PauseClassResult>("room/update-status/paused", { roomUUID });
}

export interface StopClassPayload {
    roomUUID: string;
}

export type StopClassResult = {};

export function stopClass(roomUUID: string): Promise<StopClassResult> {
    return post<StopClassPayload, StopClassResult>("room/update-status/stopped", { roomUUID });
}

type CancelOrdinaryRoomResult = {};

interface CancelOrdinaryRoomPayload {
    roomUUID: string;
}

function cancelOrdinaryRoom(roomUUID: string): Promise<CancelOrdinaryRoomResult> {
    return post<CancelOrdinaryRoomPayload, CancelOrdinaryRoomResult>("room/cancel/ordinary", {
        roomUUID,
    });
}

type CancelPeriodicRoomResult = {};

interface CancelPeriodicRoomPayload {
    periodicUUID: string;
}

export function cancelPeriodicRoom(periodicUUID: string): Promise<CancelPeriodicRoomResult> {
    return post<CancelPeriodicRoomPayload, CancelPeriodicRoomResult>("room/cancel/periodic", {
        periodicUUID,
    });
}

type CancelPeriodicSubRoomResult = {};

interface CancelPeriodicSubRoomPayload {
    roomUUID: string;
    periodicUUID: string;
}

export function cancelPeriodicSubRoom(
    payload: CancelPeriodicSubRoomPayload,
): Promise<CancelPeriodicSubRoomResult> {
    return post<CancelPeriodicSubRoomPayload, CancelPeriodicSubRoomResult>(
        "room/cancel/periodic-sub-room",
        payload,
    );
}

type CancelHistoryRoomResult = {};

interface CancelHistoryRoomPayload {
    roomUUID: string;
}

function cancelHistoryRoom(roomUUID: string): Promise<CancelHistoryRoomResult> {
    return post<CancelHistoryRoomPayload, CancelHistoryRoomResult>("room/cancel/history", {
        roomUUID,
    });
}

export type CancelRoomResult = {};

export type CancelRoomPayload = {
    all?: boolean;
    roomUUID?: string;
    periodicUUID?: string;
    isHistory?: boolean;
};

export function cancelRoom({
    all,
    roomUUID,
    periodicUUID,
    isHistory,
}: CancelRoomPayload): Promise<
    CancelPeriodicRoomResult | CancelPeriodicSubRoomResult | CancelOrdinaryRoomResult
> | void {
    if (all && periodicUUID) {
        return cancelPeriodicRoom(periodicUUID);
    }

    if (roomUUID && periodicUUID) {
        return cancelPeriodicSubRoom({ roomUUID, periodicUUID });
    }

    if (isHistory && roomUUID) {
        return cancelHistoryRoom(roomUUID);
    }

    if (!isHistory && roomUUID) {
        return cancelOrdinaryRoom(roomUUID);
    }

    return;
}

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

export interface UpdateOrdinaryRoomPayload {
    roomUUID: string;
    beginTime: number;
    endTime: number;
    title: string;
    type: RoomType;
    docs?: Array<{
        /**文档类型 */
        type: DocsType;
        /**文档的 uuid */
        uuid: string;
    }>;
}

export type UpdateOrdinaryRoomResult = {};

export async function updateOrdinaryRoom(payload: UpdateOrdinaryRoomPayload): Promise<void> {
    await post<UpdateOrdinaryRoomPayload, UpdateOrdinaryRoomResult>(
        "room/update/ordinary",
        payload,
    );
}
export interface UpdatePeriodicRoomPayload {
    periodicUUID: string;
    beginTime: number;
    endTime: number;
    title: string;
    type: RoomType;
    /** 重复 */
    periodic:
        | {
              /**重复周期, 每周的周几 */
              weeks: Week[];
              /** 重复几次就结束, -1..50 */
              rate: number;
          }
        | {
              weeks: Week[];
              /** UTC时间戳, 到这个点就结束 */
              endTime: number;
          };
    docs?: Array<{
        /**文档类型 */
        type: DocsType;
        /**文档的 uuid */
        uuid: string;
    }>;
}

export type UpdatePeriodicRoomResult = {};

export async function updatePeriodicRoom(payload: UpdatePeriodicRoomPayload): Promise<void> {
    await post<UpdatePeriodicRoomPayload, UpdatePeriodicRoomResult>(
        "room/update/periodic",
        payload,
    );
}

export interface UpdatePeriodicSubRoomPayload {
    periodicUUID: string;
    roomUUID: string;
    beginTime: number;
    endTime: number;
}

export type UpdatePeriodicSubRoomResult = {};

export async function updatePeriodicSubRoom(payload: UpdatePeriodicSubRoomPayload): Promise<void> {
    await post<UpdatePeriodicSubRoomPayload, UpdatePeriodicSubRoomResult>(
        "room/update/periodic-sub-room",
        payload,
    );
}

export interface LoginCheckPayload {
    type: "web" | "mobile";
}

export interface LoginCheckResult {
    name: string;
    sex: Sex;
    avatar: string; // 头像地址
    userUUID: string; // 用户信息，需要进行保存
}

export async function loginCheck(): Promise<LoginCheckResult> {
    return await post<LoginCheckPayload, LoginCheckResult>("login", {
        type: "web",
    });
}

export interface setAuthUUIDPayload {
    authUUID: string;
}

export interface setAuthUUIDResult {
    authUUID: string;
}

export async function setAuthUUID(authUUID: string): Promise<setAuthUUIDResult> {
    return await postNotAuth<setAuthUUIDPayload, setAuthUUIDResult>("login/set-auth-uuid", {
        authUUID,
    });
}

export interface LoginProcessPayload {
    authUUID: string;
}

export interface LoginProcessResult {
    name: string;
    sex: Sex;
    avatar: string;
    userUUID: string;
    token: string;
}

export async function loginProcess(authUUID: string): Promise<LoginProcessResult> {
    return await postNotAuth<LoginProcessPayload, LoginProcessResult>("login/process", {
        authUUID,
    });
}

import Axios from "axios";
import { getWechatInfo } from "../../utils/localStorage/accounts";
import { DocsType, FLAT_SERVER_VERSIONS, RoomDoc, RoomStatus, RoomType, Week } from "./constants";
import { post } from "./utils";

export interface CreateRoomPayload {
    /** 房间主题, 最多 50 字 */
    title: string;
    /** 上课类型 */
    type: RoomType;
    /** UTC时间戳 */
    beginTime: number;
    /**课件 */
    docs?: Array<{
        /**文档类型 */
        type: DocsType;
        /**文档的 uuid */
        uuid: string;
    }>;
}

export interface CreateRoomResult {
    roomUUID: string;
}

export async function createRoom(payload: CreateRoomPayload): Promise<string> {
    const res = await post<CreateRoomPayload, CreateRoomResult>("room/create", payload);
    return res.roomUUID;
}

export interface ScheduleRoomPayload {
    /** 房间主题, 最多 50 字 */
    title: string;
    /** 上课类型 */
    type: RoomType;
    /** UTC时间戳 */
    beginTime: number;
    endTime: number;
    /** 重复 */
    periodic?:
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

export type ScheduleRoomResult = undefined;

export async function scheduleRoom(payload: ScheduleRoomPayload): Promise<void> {
    await post<ScheduleRoomPayload, ScheduleRoomResult>("room/schedule", payload);
}

export enum ListRoomsType {
    All = "all",
    Today = "today",
    Periodic = "periodic",
    History = "history",
}

export interface FlatServerRoom {
    roomUUID: string; // 房间的 uuid
    periodicUUID: string | null; // 周期性房间的 uuid
    ownerUUID: string; // 房间所有者的 uuid
    ownerUserName: string; // 房间所有者的名称
    title: string; // 房间标题
    beginTime: string; // 房间开始时间(UTC时间戳，如: 2020-12-28T08:29:29.068Z)
    endTime: string; // 结束时间，有可能为空，因为立刻创建房间是没有结束时间的
    roomStatus: RoomStatus; // 房间状态
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
    roomUUID: string; // 当前房间的 UUID
    whiteboardRoomToken: string; // 白板的 room token
    whiteboardRoomUUID: string; // 白板的 room uuid
    rtcUID: number; // rtc 的 uid
    rtcToken: string; // rtc token
    rtmToken: string; // rtm token
    roomType: RoomType;
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
    beginTime: string;
    endTime: string;
    roomType: RoomType;
    roomStatus: RoomStatus;
    ownerUUID: string;
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
    beginTime: string;
    endTime: string;
    roomType: RoomType;
    roomStatus: RoomStatus;
    ownerUUID: string;
}

export interface PeriodicSubRoomInfoResult {
    roomInfo: PeriodicSubRoomInfo;
    previousPeriodicRoomBeginTime: string; // 上一节课的开始时间
    nextPeriodicRoomEndTime: string; // 下一节课的结束时间
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
        endTime: string; // 有可能为空
        rate: number | null; // 默认为 0（即 用户选择的是 endTime）
        roomType: RoomType;
    };
    rooms: Array<{
        roomUUID: string;
        beginTime: string;
        endTime: string;
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

export type CancelOrdinaryRoomResult = {};

export interface CancelOrdinaryRoomPayload {
    roomUUID: string;
}

export function cancelOrdinaryRoom(roomUUID: string): Promise<CancelOrdinaryRoomResult> {
    return post<CancelOrdinaryRoomPayload, CancelOrdinaryRoomResult>("room/cancel/ordinary", {
        roomUUID,
    });
}

export type CancelPeriodicRoomResult = {};

export interface CancelPeriodicRoomPayload {
    periodicUUID: string;
}

export function cancelPeriodicRoom(periodicUUID: string): Promise<CancelPeriodicRoomResult> {
    return post<CancelPeriodicRoomPayload, CancelPeriodicRoomResult>("room/cancel/periodic", {
        periodicUUID,
    });
}

export type CancelHistoryRoomResult = {};

export interface CancelHistoryRoomPayload {
    roomUUID: string;
}

export function cancelHistoryRoom(roomUUID: string): Promise<CancelHistoryRoomResult> {
    return post<CancelHistoryRoomPayload, CancelHistoryRoomResult>("room/cancel/history", {
        roomUUID,
    });
}

export interface LoginCheck {
    name: string;
    sex: "Man" | "Woman";
    avatar: string; // 头像地址
    userUUID: string; // 用户信息，需要进行保存
}

export async function loginCheck(): Promise<LoginCheck> {
    const Authorization = getWechatInfo()?.token;
    if (!Authorization) {
        throw new Error("not login");
    }
    const { data } = await Axios.post<LoginCheck>(
        `${FLAT_SERVER_VERSIONS.V1HTTPS}/login`,
        undefined,
        {
            headers: {
                Authorization: "Bearer " + Authorization,
            },
        },
    );
    return data;
}

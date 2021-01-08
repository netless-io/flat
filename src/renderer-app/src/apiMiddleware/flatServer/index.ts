import Axios, { AxiosRequestConfig } from "axios";
import { getWechatInfo } from "../../utils/localStorage/accounts";
import { DocsType, FLAT_SERVER_VERSIONS, RoomStatus, RoomType, Status, Week } from "./constants";

export type FlatServerResponse<T> =
    | {
          status: Status.Success;
          data: T;
      }
    | {
          status: Status.Failed;
          code: number;
      };

async function post<Payload, Result>(
    action: string,
    payload: Payload,
    params?: AxiosRequestConfig["params"],
): Promise<Result> {
    const config: AxiosRequestConfig = {
        timeout: 1000,
        params,
    };

    const Authorization = getWechatInfo()?.token;
    if (Authorization) {
        config.headers = {
            Authorization: "Bearer " + Authorization,
        };
    }

    const { data: res } = await Axios.post<FlatServerResponse<Result>>(
        `${FLAT_SERVER_VERSIONS.V1HTTPS}/${action}`,
        payload,
        config,
    );

    if (res.status !== Status.Success) {
        // @TODO handle fetcher error
        throw new Error(`Flat server error code ${res.code}`);
    }

    return res.data;
}

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
    periodicUUID: string; // 周期性房间的 uuid
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
    roomUUID: string;
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

export function joinRoom(roomUUID: string): Promise<JoinRoomResult> {
    return post<JoinRoomPayload, JoinRoomResult>("room/join", { roomUUID });
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
}

export function ordinaryRoomInfo(roomUUID: string): Promise<OrdinaryRoomInfoResult> {
    return post<OrdinaryRoomInfoPayload, OrdinaryRoomInfoResult>("room/info/ordinary", {
        roomUUID,
    });
}

export interface PeriodicSubRoomInfoPayload {
    periodicUUID: string;
    roomUUID: string;
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
}

export function periodicSubRoomInfo(roomUUID: string, periodicUUID: string): Promise<PeriodicSubRoomInfoResult> {
    return post<PeriodicSubRoomInfoPayload, PeriodicSubRoomInfoResult>("/room/info/periodic-sub-room", {
        roomUUID,
        periodicUUID,
    })
}

export interface PeriodicRoomInfoPayload {
    periodicUUID: string;
}

export type PeriodicRoomInfoResult = {
    periodic: {
        ownerUUID: string; // 创建者的 uuid
        endTime: string; // 有可能为空
        rate: number; // 默认为 0（即 用户选择的是 endTime）
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

export type CancelOrdinaryRoomResult = undefined;

export interface CancelOrdinaryRoomPayload {
    roomUUID: string;
}

export function cancelOrdinaryRoom(roomUUID: string): Promise<CancelOrdinaryRoomResult>{
    return post<OrdinaryRoomInfoPayload, CancelOrdinaryRoomResult>("room/cancel/periodic", {
        roomUUID,
    })
}


export type CancelPeriodicRoomResult = undefined;

export interface CancelPeriodicRoomPayload {
    perdiodicUUID: string;
}

export function cancelPeriodicRoom(periodicUUID: string): Promise<CancelPeriodicRoomResult>{
    return post<PeriodicRoomInfoPayload, CancelPeriodicRoomResult>("room/cancel/periodic", {
        periodicUUID,
    })
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

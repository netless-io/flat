/* eslint-disable no-redeclare */
import { makeAutoObservable, observable } from "mobx";
import {
    createOrdinaryRoom,
    CreateOrdinaryRoomPayload,
    createPeriodicRoom,
    CreatePeriodicRoomPayload,
    joinRoom,
    listRooms,
    ListRoomsPayload,
    ListRoomsType,
    ordinaryRoomInfo,
    periodicRoomInfo,
    PeriodicRoomInfoResult,
    periodicSubRoomInfo,
    PeriodicSubRoomInfoPayload,
} from "../apiMiddleware/flatServer";
import { RoomStatus, RoomType } from "../apiMiddleware/flatServer/constants";
import { globalStore } from "./GlobalStore";

// Sometime we may only have pieces of the room info
/** Ordinary room + periodic sub-room */
export interface RoomItem {
    roomUUID: string;
    periodicUUID?: string | null;
    /** 房间所有者的 uuid */
    ownerUUID?: string;
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
    previousPeriodicRoomBeginTime?: string;
    /** 下一节课的结束时间 */
    nextPeriodicRoomEndTime?: string;
    /** 当前周期性房间下一共有多少节课 */
    count?: number;
}

// Only keep subroom ids. Subroom info are stored in ordinaryRooms.
export interface PeriodicRoomItem {
    periodicUUID: string;
    periodic: {
        /** 创建者的 uuid */
        ownerUUID: string;
        /** 有可能为空 */
        endTime: number;
        /** 默认为 0（即 用户选择的是 endTime） */
        rate: number | null;
        roomType: RoomType;
    };
    rooms: string[];
}

/**
 * Caches all the visited rooms.
 * This should be the only central store for all the room info.
 */
export class RoomStore {
    rooms = observable.map<string, RoomItem>();
    periodicRooms = observable.map<string, PeriodicRoomItem>();

    constructor() {
        makeAutoObservable(this);
    }

    /**
     * @returns roomUUID
     */
    async createOrdinaryRoom(payload: CreateOrdinaryRoomPayload): Promise<string> {
        const roomUUID = await createOrdinaryRoom(payload);
        this.updateRoom(roomUUID, { ...payload });
        return roomUUID;
    }

    async createPeriodicRoom(payload: CreatePeriodicRoomPayload): Promise<void> {
        await createPeriodicRoom(payload);
        // need roomUUID and periodictUUID from server to cache the payload
    }

    async joinRoom(roomUUID: string): Promise<void> {
        const data = await joinRoom(roomUUID);
        globalStore.updateToken(data);
    }

    /**
     * @returns a list of room uuids
     */
    async listRooms(type: ListRoomsType, payload: ListRoomsPayload): Promise<string[]> {
        const rooms = await listRooms(type, payload);
        const roomUUIDs: string[] = [];
        for (const room of rooms) {
            roomUUIDs.push(room.roomUUID);
            this.updateRoom(room.roomUUID, convertStartEndTime(room));
        }
        return roomUUIDs;
    }

    async syncOrdinaryRoomInfo(roomUUID: string): Promise<void> {
        const { roomInfo, ...restInfo } = await ordinaryRoomInfo(roomUUID);
        this.updateRoom(roomUUID, {
            ...restInfo,
            ...convertStartEndTime(roomInfo),
            roomUUID,
        });
    }

    async syncPeriodicRoomInfo(periodicUUID: string): Promise<void> {
        this.updatePeriodicRoom(periodicUUID, await periodicRoomInfo(periodicUUID));
    }

    async syncPeriodicSubRoomInfo(payload: PeriodicSubRoomInfoPayload): Promise<void> {
        const { roomInfo, ...restInfo } = await periodicSubRoomInfo(payload);
        this.updateRoom(payload.roomUUID, {
            ...restInfo,
            ...convertStartEndTime(roomInfo),
            roomUUID: payload.roomUUID,
            periodicUUID: payload.periodicUUID,
        });
    }

    updateRoom(roomUUID: string, roomInfo: Partial<RoomItem>): void {
        const room = this.rooms.get(roomUUID);
        if (room) {
            const keys = (Object.keys(roomInfo) as unknown) as Array<keyof RoomItem>;
            for (const key of keys) {
                if (key !== "roomUUID") {
                    (room[key] as any) = roomInfo[key];
                }
            }
        } else {
            this.rooms.set(roomUUID, { ...roomInfo, roomUUID });
        }
    }

    updatePeriodicRoom(periodicUUID: string, roomInfo: PeriodicRoomInfoResult): void {
        roomInfo.rooms.forEach(room => {
            this.updateRoom(room.roomUUID, {
                ...convertStartEndTime(room),
                periodicUUID: periodicUUID,
            });
        });
        this.periodicRooms.set(periodicUUID, {
            periodicUUID,
            periodic: convertStartEndTime(roomInfo.periodic),
            rooms: roomInfo.rooms.map(room => room.roomUUID),
        });
    }
}

export const roomStore = new RoomStore();

export function isPeriodicSubRoom(room: RoomItem): boolean {
    return Boolean(room.periodicUUID);
}

/**
 * convert UTC string time to unix number
 */
function convertStartEndTime<O extends { beginTime: string; endTime: string }>(
    rawRoomInfo: O,
): Omit<O, "beginTime" | "endTime"> & { beginTime: number; endTime: number };
function convertStartEndTime<O extends { endTime: string }>(
    rawRoomInfo: O,
): Omit<O, "endTime"> & { endTime: number };
function convertStartEndTime<O extends { beginTime?: string; endTime?: string }>(
    rawRoomInfo: O,
): Omit<O, "beginTime" | "endTime"> & { beginTime?: number; endTime?: number };
function convertStartEndTime<O extends { beginTime?: string; endTime?: string }>(
    rawRoomInfo: O,
): Omit<O, "beginTime" | "endTime"> & { beginTime?: number; endTime?: number } {
    const { beginTime, endTime, ...restInfo } = rawRoomInfo;
    const roomInfo: Omit<O, "beginTime" | "endTime"> & {
        beginTime?: number;
        endTime?: number;
    } = restInfo;

    if (Object.prototype.hasOwnProperty.call(roomInfo, "beginTime")) {
        roomInfo.beginTime = beginTime ? new Date(beginTime).valueOf() : void 0;
    }

    if (Object.prototype.hasOwnProperty.call(roomInfo, "endTime")) {
        roomInfo.endTime = endTime ? new Date(endTime).valueOf() : void 0;
    }

    return roomInfo;
}

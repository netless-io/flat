/* eslint-disable no-redeclare */
import { makeAutoObservable, observable, runInAction } from "mobx";
import { Region } from "flat-components";
import {
    cancelRoom,
    CancelRoomPayload,
    createOrdinaryRoom,
    CreateOrdinaryRoomPayload,
    createPeriodicRoom,
    CreatePeriodicRoomPayload,
    joinRoom,
    JoinRoomResult,
    listRooms,
    ListRoomsPayload,
    ListRoomsType,
    ordinaryRoomInfo,
    periodicRoomInfo,
    PeriodicRoomInfoResult,
    periodicSubRoomInfo,
    PeriodicSubRoomInfoPayload,
    recordInfo,
} from "../apiMiddleware/flatServer";
import { RoomDoc, RoomStatus, RoomType } from "../apiMiddleware/flatServer/constants";
import { globalStore } from "./GlobalStore";
import { configStore } from "./ConfigStore";

// Sometime we may only have pieces of the room info
/** Ordinary room + periodic sub-room */
export interface RoomItem {
    /** 普通房间或周期性房间子房间的 uuid */
    roomUUID: string;
    /** 房间所有者的 uuid */
    ownerUUID: string;
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
    /** 区域 */
    region?: Region;
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
    /**课件 */
    docs?: RoomDoc[];
    /** 是否存在录制(只有历史记录才会有) */
    hasRecord?: boolean;
    /** 录制记录 */
    recordings?: Array<{
        beginTime: number;
        endTime: number;
        videoURL?: string;
    }>;
}

// Only keep subroom ids. Subroom info are stored in ordinaryRooms.
export interface PeriodicRoomItem {
    periodicUUID: string;
    periodic: PeriodicRoomInfoResult["periodic"];
    rooms: string[];
}

/**
 * Caches all the visited rooms.
 * This should be the only central store for all the room info.
 */
export class RoomStore {
    public rooms = observable.map<string, RoomItem>();
    public periodicRooms = observable.map<string, PeriodicRoomItem>();

    public constructor() {
        makeAutoObservable(this);
    }

    /**
     * @returns roomUUID
     */
    public async createOrdinaryRoom(payload: CreateOrdinaryRoomPayload): Promise<string> {
        if (!globalStore.userUUID) {
            throw new Error("cannot create room: user not login.");
        }

        const roomUUID = await createOrdinaryRoom(payload);
        configStore.setRegion(payload.region);
        const { docs, ...restPayload } = payload;
        this.updateRoom(roomUUID, globalStore.userUUID, {
            ...restPayload,
            docs:
                docs &&
                docs.map(doc => ({ docType: doc.type, docUUID: doc.uuid, isPreload: false })),
            roomUUID,
        });
        return roomUUID;
    }

    public async createPeriodicRoom(payload: CreatePeriodicRoomPayload): Promise<void> {
        await createPeriodicRoom(payload);
        configStore.setRegion(payload.region);
        // need roomUUID and periodicUUID from server to cache the payload
    }

    public async joinRoom(roomUUID: string): Promise<JoinRoomResult> {
        const data = await joinRoom(roomUUID);
        globalStore.updateToken(data);
        this.updateRoom(roomUUID, data.ownerUUID, {
            roomUUID,
            ownerUUID: data.ownerUUID,
            roomType: data.roomType,
        });
        return data;
    }

    /**
     * @returns a list of room uuids
     */
    public async listRooms(type: ListRoomsType, payload: ListRoomsPayload): Promise<string[]> {
        const rooms = await listRooms(type, payload);
        const roomUUIDs: string[] = [];
        runInAction(() => {
            for (const room of rooms) {
                roomUUIDs.push(room.roomUUID);
                this.updateRoom(room.roomUUID, room.ownerUUID, {
                    ...room,
                    periodicUUID: room.periodicUUID || void 0,
                });
            }
        });
        return roomUUIDs;
    }

    public async cancelRoom(payload: CancelRoomPayload): Promise<void> {
        await cancelRoom(payload);
    }

    public async syncOrdinaryRoomInfo(roomUUID: string): Promise<void> {
        const { roomInfo, ...restInfo } = await ordinaryRoomInfo(roomUUID);
        this.updateRoom(roomUUID, roomInfo.ownerUUID, {
            ...restInfo,
            ...roomInfo,
            roomUUID,
        });
    }

    public async syncPeriodicRoomInfo(periodicUUID: string): Promise<void> {
        this.updatePeriodicRoom(periodicUUID, await periodicRoomInfo(periodicUUID));
    }

    public async syncPeriodicSubRoomInfo(payload: PeriodicSubRoomInfoPayload): Promise<void> {
        const { roomInfo, previousPeriodicRoomBeginTime, nextPeriodicRoomEndTime, ...restInfo } =
            await periodicSubRoomInfo(payload);
        this.updateRoom(payload.roomUUID, roomInfo.ownerUUID, {
            ...restInfo,
            ...roomInfo,
            previousPeriodicRoomBeginTime: previousPeriodicRoomBeginTime ?? void 0,
            nextPeriodicRoomEndTime: nextPeriodicRoomEndTime ?? void 0,
            roomUUID: payload.roomUUID,
            periodicUUID: payload.periodicUUID,
        });
    }

    public async syncRecordInfo(roomUUID: string): Promise<void> {
        const roomInfo = await recordInfo(roomUUID);
        const {
            ownerUUID,
            title,
            roomType,
            recordInfo: recordings,
            whiteboardRoomToken,
            whiteboardRoomUUID,
            region,
            rtmToken,
        } = roomInfo;
        this.updateRoom(roomUUID, ownerUUID, {
            title,
            roomType,
            recordings,
            roomUUID,
            region,
        });
        globalStore.updateToken({
            whiteboardRoomToken,
            whiteboardRoomUUID,
            rtmToken,
            region,
        });
    }

    public updateRoom(roomUUID: string, ownerUUID: string, roomInfo: Partial<RoomItem>): void {
        const room = this.rooms.get(roomUUID);
        if (room) {
            const keys = Object.keys(roomInfo) as unknown as Array<keyof RoomItem>;
            for (const key of keys) {
                if (key !== "roomUUID") {
                    (room[key] as any) = roomInfo[key];
                }
            }
        } else {
            this.rooms.set(roomUUID, { ...roomInfo, roomUUID, ownerUUID });
        }
    }

    public updatePeriodicRoom(periodicUUID: string, roomInfo: PeriodicRoomInfoResult): void {
        roomInfo.rooms.forEach(room => {
            this.updateRoom(room.roomUUID, roomInfo.periodic.ownerUUID, {
                ...room,
                title: roomInfo.periodic.title,
                roomType: roomInfo.periodic.roomType,
                periodicUUID: periodicUUID,
            });
        });
        this.periodicRooms.set(periodicUUID, {
            periodicUUID,
            periodic: roomInfo.periodic,
            rooms: roomInfo.rooms.map(room => room.roomUUID),
        });
    }
}

export const roomStore = new RoomStore();

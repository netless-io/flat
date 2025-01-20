/* eslint no-redeclare: off */
import { makeAutoObservable, observable, runInAction } from "mobx";
import { Region } from "flat-components";
import {
    cancelRoom,
    CancelRoomPayload,
    CreateAIRoomPayload,
    createOrdinaryRoom,
    CreateOrdinaryRoomPayload,
    createPeriodicRoom,
    CreatePeriodicRoomPayload,
    isPmiRoom,
    joinRoom,
    JoinRoomResult,
    listRooms,
    ListRoomsType,
    ordinaryRoomInfo,
    periodicRoomInfo,
    PeriodicRoomInfoResult,
    periodicSubRoomInfo,
    PeriodicSubRoomInfoPayload,
    recordInfo,
    RoomStatus,
    RoomType,
} from "@netless/flat-server-api";
import { FlatI18n } from "@netless/flat-i18n";
import { globalStore } from "./global-store";
import { preferencesStore } from "./preferences-store";

export interface RoomRecording {
    beginTime: number;
    endTime: number;
    videoURL?: string;
}

// Sometime we may only have pieces of the room info
/** Ordinary room + periodic sub-room */
export interface RoomItem {
    roomUUID: string;
    ownerUUID: string;
    inviteCode?: string;
    roomType?: RoomType;
    periodicUUID?: string;
    ownerName?: string;
    ownerAvatarURL?: string;
    title?: string;
    roomStatus?: RoomStatus;
    region?: Region;
    beginTime?: number;
    endTime?: number;
    previousPeriodicRoomBeginTime?: number;
    nextPeriodicRoomEndTime?: number;
    count?: number;
    hasRecord?: boolean;
    recordings?: RoomRecording[];
    isPmi?: boolean;
    billing?: {
        expireAt: number;
        vipLevel: 0 | 1;
    };
    isAI?: boolean;
}

// Only keep sub-room ids. sub-room info are stored in ordinaryRooms.
export interface PeriodicRoomItem {
    periodicUUID: string;
    periodic: PeriodicRoomInfoResult["periodic"];
    rooms: string[];
    inviteCode: string;
}

/**
 * Caches all the visited rooms.
 * This should be the only central store for all the room info.
 */
export class RoomStore {
    public readonly singlePageSize = 50;

    public rooms = observable.map<string, RoomItem>();
    public periodicRooms = observable.map<string, PeriodicRoomItem>();

    /**
     * Home page room list data, only contains room UUID.
     * Each time `listRooms({ page: 1 })` is called, it should update this list.
     */
    public roomUUIDs: Record<ListRoomsType, string[]> = {
        all: [],
        periodic: [],
        today: [],
        history: [],
    };

    /** If `fetchMoreRooms()` returns 0 rooms, stop fetching it */
    public hasMoreRooms: Record<ListRoomsType, boolean> = {
        all: true,
        periodic: true,
        history: true,
        today: true,
    };

    /** Don't invoke `fetchMoreRooms()` too many times */
    public isFetchingRooms = false;

    private roomToRemember = "";

    public constructor() {
        makeAutoObservable(this);
    }

    /**
     * @returns roomUUID
     */
    public async createAIRoom(payload: CreateAIRoomPayload): Promise<string> {
        if (!globalStore.userUUID) {
            throw new Error("cannot create room: user not login.");
        }

        const roomUUID = await createOrdinaryRoom(payload);
        preferencesStore.setRegion(payload.region);
        globalStore.setAIInfo({
            role: payload.role,
            scene: payload.scene || "",
            language: payload.language,
        });
        const { ...restPayload } = payload;
        this.updateRoom(roomUUID, globalStore.userUUID, {
            ...restPayload,
            roomUUID,
        });

        if (payload.pmi) {
            globalStore.updatePmiRoomList();
        }
        return roomUUID;
    }
    /**
     * @returns roomUUID
     */
    public async createOrdinaryRoom(payload: CreateOrdinaryRoomPayload): Promise<string> {
        if (!globalStore.userUUID) {
            throw new Error("cannot create room: user not login.");
        }

        const roomUUID = await createOrdinaryRoom(payload);
        preferencesStore.setRegion(payload.region);
        globalStore.setAIInfo(undefined);
        const { ...restPayload } = payload;
        this.updateRoom(roomUUID, globalStore.userUUID, {
            ...restPayload,
            roomUUID,
        });

        if (payload.pmi) {
            globalStore.updatePmiRoomList();
        }
        return roomUUID;
    }

    public async createPeriodicRoom(payload: CreatePeriodicRoomPayload): Promise<void> {
        await createPeriodicRoom(payload);
        preferencesStore.setRegion(payload.region);
        // need roomUUID and periodicUUID from server to cache the payload
    }

    /**
     * @param uuid May be inviteCode or roomUUID or periodicUUID.
     */
    public async joinRoom(uuid: string): Promise<JoinRoomResult> {
        const data = await joinRoom(uuid);
        globalStore.updateToken(data);
        this.updateRoom(data.roomUUID, data.ownerUUID, {
            roomUUID: data.roomUUID,
            ownerUUID: data.ownerUUID,
            roomType: data.roomType,
            billing: data.billing,
        });
        return data;
    }

    /**
     * @returns a list of room uuids
     */
    public async listRooms(type: ListRoomsType): Promise<string[]> {
        const rooms = await listRooms(type, { page: 1 });
        const roomUUIDs: string[] = [];
        runInAction(() => {
            for (const room of rooms) {
                roomUUIDs.push(room.roomUUID);
                this.updateRoom(room.roomUUID, room.ownerUUID, {
                    ...room,
                    periodicUUID: room.periodicUUID || void 0,
                });
            }
            const isSameRoomUUIDs =
                this.roomUUIDs[type].length >= roomUUIDs.length &&
                this.roomUUIDs[type]
                    .slice(0, this.singlePageSize)
                    .every((uuid, i) => uuid === roomUUIDs[i]);
            if (!isSameRoomUUIDs) {
                this.roomUUIDs[type] = roomUUIDs;
            }
        });
        return roomUUIDs;
    }

    public async fetchMoreRooms(type: ListRoomsType): Promise<void> {
        if (this.isFetchingRooms) {
            return;
        }

        const counts = this.roomUUIDs;

        const page = Math.ceil(counts[type].length / this.singlePageSize);
        const fullPageSize = page * this.singlePageSize;
        if (counts[type].length >= fullPageSize && this.hasMoreRooms[type]) {
            runInAction(() => {
                this.isFetchingRooms = true;
            });

            try {
                const rooms = await listRooms(type, {
                    page: page + 1,
                });

                this.hasMoreRooms[type] = rooms.length > 0;

                runInAction(() => {
                    this.isFetchingRooms = false;

                    for (const room of rooms) {
                        this.updateRoom(room.roomUUID, room.ownerUUID, {
                            ...room,
                            periodicUUID: room.periodicUUID || void 0,
                        });
                    }

                    const isSameRoomUUIDs =
                        counts[type].length >= fullPageSize + rooms.length &&
                        counts[type]
                            .slice(fullPageSize, fullPageSize + rooms.length)
                            .every((uuid, i) => uuid === rooms[i].roomUUID);
                    if (!isSameRoomUUIDs) {
                        counts[type] = counts[type]
                            .slice(0, fullPageSize)
                            .concat(rooms.map(room => room.roomUUID));
                    }
                });
            } catch {
                runInAction(() => {
                    this.isFetchingRooms = false;
                });
            }
        }
    }

    public async cancelRoom(payload: CancelRoomPayload): Promise<void> {
        await cancelRoom(payload);

        if (payload.roomUUID) {
            globalStore.updatePmiRoomListByRoomUUID(payload.roomUUID);
        }
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
        if (this.roomToRemember && this.roomToRemember === roomInfo.inviteCode && roomInfo.title) {
            this.updateRoomHistory(roomInfo);
        }
    }

    public updatePeriodicRoom(periodicUUID: string, roomInfo: PeriodicRoomInfoResult): void {
        roomInfo.rooms.forEach(room => {
            this.updateRoom(room.roomUUID, roomInfo.periodic.ownerUUID, {
                ...room,
                inviteCode: roomInfo.periodic.inviteCode,
                title: roomInfo.periodic.title,
                roomType: roomInfo.periodic.roomType,
                periodicUUID: periodicUUID,
                ownerName: roomInfo.periodic.ownerName,
            });
        });
        this.periodicRooms.set(periodicUUID, {
            periodicUUID,
            periodic: roomInfo.periodic,
            rooms: roomInfo.rooms.map(room => room.roomUUID),
            inviteCode: roomInfo.periodic.inviteCode,
        });
    }

    public rememberNextRoom(inviteCode: string): void {
        this.roomToRemember = inviteCode;
    }

    private async updateRoomHistory(roomInfo: Partial<RoomItem>): Promise<void> {
        const { inviteCode, title, ownerName } = roomInfo;
        if (inviteCode) {
            if (await isPmiRoom({ pmi: inviteCode })) {
                globalStore.updateRoomHistory({
                    uuid: inviteCode,
                    title: FlatI18n.t("pmi-create-room-default-title", { name: ownerName }),
                });
            } else {
                globalStore.updateRoomHistory({
                    uuid: inviteCode,
                    title: title || FlatI18n.t("create-room-default-title", { name: ownerName }),
                });
            }
            runInAction(() => {
                this.roomToRemember = "";
            });
        }
    }
}

export const roomStore = new RoomStore();

if (process.env.DEV) {
    (window as any).roomStore = roomStore;
}

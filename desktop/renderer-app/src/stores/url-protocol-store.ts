import type { RoomType } from "@netless/flat-server-api";
import { makeAutoObservable } from "mobx";

export class URLProtocolStore {
    // Receive the roomUUID parameters from ipc that for join room.
    public toJoinRoomUUID: string | null;
    public toReplayRoom: { roomUUID: string; ownerUUID: string; roomType: RoomType } | null;

    public constructor() {
        this.toJoinRoomUUID = null;
        this.toReplayRoom = null;
        makeAutoObservable(this);
    }

    public updateToJoinRoomUUID = (roomUUID: string): void => {
        this.toJoinRoomUUID = roomUUID;
    };

    public clearToJoinRoomUUID(): void {
        this.toJoinRoomUUID = null;
    }

    public updateToReplayRoom(roomUUID: string, ownerUUID: string, roomType: string): void {
        if (this.isRoomType(roomType)) {
            this.toReplayRoom = { roomUUID, ownerUUID, roomType };
        }
    }

    private isRoomType(string: string): string is RoomType {
        return string === "OneToOne" || string === "SmallClass" || string === "BigClass";
    }

    public clearToReplayRoom(): void {
        this.toReplayRoom = null;
    }
}

export const urlProtocolStore = new URLProtocolStore();

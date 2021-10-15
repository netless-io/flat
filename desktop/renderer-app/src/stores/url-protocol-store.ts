import { makeAutoObservable } from "mobx";

export class URLProtocolStore {
    // Receive the roomUUID parameters from ipc that for join room.
    public toJoinRoomUUID: string | null;

    public constructor() {
        this.toJoinRoomUUID = null;
        makeAutoObservable(this);
    }

    public updateToJoinRoomUUID = (roomUUID: string): void => {
        this.toJoinRoomUUID = roomUUID;
    };

    public clearToJoinRoomUUID(): void {
        this.toJoinRoomUUID = null;
    }
}

export const urlProtocolStore = new URLProtocolStore();

import Emittery from "emittery";

export interface FlatRTCDevice {
    deviceid: string;
    devicename: string;
}
export interface FlatRTCEventData {
    network: {
        delay: number;
        uplink: number;
        downlink: number;
    };
}

export type FlatRTCEventNames = keyof FlatRTCEventData;

export interface FlatRTCJoinRoomConfigBase<TUid = number> {
    roomUUID: string;
    uid: TUid;
}

export interface FlatRTC<
    TUid = number,
    TJoinRoomConfig extends FlatRTCJoinRoomConfigBase<TUid> = FlatRTCJoinRoomConfigBase<TUid>,
> {
    events: Emittery<FlatRTCEventData, FlatRTCEventData>;

    destroy(): Promise<void>;

    joinRoom(config: TJoinRoomConfig): Promise<void>;
    leaveRoom(): Promise<void>;

    getAvatar(uid: TUid): FlatRTCAvatar | null;
    getVolumeLevel(uid: TUid): number;
}

export interface FlatRTCAvatar {
    enableCamera(enabled: boolean): void;
    enableMic(enabled: boolean): void;
    setElement(element: HTMLElement | null): void;
    getVolumeLevel(): number;
    destroy(): void;
}

import Emittery from "emittery";

export interface FlatRTCDevice {
    deviceId: string;
    label: string;
}
export interface FlatRTCEventData {
    network: {
        delay: number;
        uplink: number;
        downlink: number;
    };
    "volume-level-changed": number;
    /** When a video capture device is added or removed */
    "camera-changed": string;
    /** When an audio sampling device is added or removed */
    "mic-changed": string;
    /** When an audio playback device is added or removed */
    "speaker-changed": string;
    "err-set-camera": Error;
    "err-set-mic": Error;
    "err-low-volume": undefined;
}

export type FlatRTCEventNames = keyof FlatRTCEventData;

export interface FlatRTCJoinRoomConfigBase<TUid = number> {
    roomUUID: string;
    uid: TUid;
}

export interface FlatRTCAvatar {
    enableCamera(enabled: boolean): void;
    enableMic(enabled: boolean): void;
    setElement(element: HTMLElement | null): void;
    getVolumeLevel(): number;
    destroy(): void;
}

export abstract class FlatRTC<
    TUid = number,
    TJoinRoomConfig extends FlatRTCJoinRoomConfigBase<TUid> = FlatRTCJoinRoomConfigBase<TUid>,
> {
    public static APP_ID: string;

    public static getInstance: (APP_ID?: string) => FlatRTC;

    public abstract events: Emittery<FlatRTCEventData, FlatRTCEventData>;

    public abstract destroy(): Promise<void>;

    public abstract joinRoom(config: TJoinRoomConfig): Promise<void>;
    public abstract leaveRoom(): Promise<void>;

    /** @returns local avatar if uid is not provided */
    public abstract getAvatar(uid?: TUid): FlatRTCAvatar | null;
    public abstract getVolumeLevel(uid: TUid): number;

    public abstract setCameraID(deviceId: string): Promise<void>;
    public abstract getCameraID(): string | undefined;

    public abstract setMicID(deviceId: string): Promise<void>;
    public abstract getMicID(): string | undefined;

    public abstract setSpeakerID(deviceId: string): Promise<void>;
    public abstract getSpeakerID(): string | undefined;

    public abstract getCameraDevices(): Promise<FlatRTCDevice[]>;
    public abstract getMicDevices(): Promise<FlatRTCDevice[]>;
    public abstract getSpeakerDevices(): Promise<FlatRTCDevice[]>;
}

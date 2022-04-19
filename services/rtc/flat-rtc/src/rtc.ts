import type { FlatRTCAvatar } from "./avatar";
import type { FlatRTCMode, FlatRTCRole } from "./constants";
import type { FlatRTCDevice } from "./device";
import type { FlatRTCEvents } from "./events";

export interface FlatRTCJoinRoomConfigBase<TUid = number> {
    roomUUID: string;
    uid: TUid;
    mode?: FlatRTCMode;
    role?: FlatRTCRole;
    token?: string | null;
    refreshToken?: (roomUUID: string) => Promise<string>;
    /** Skip subscribing local uids */
    isLocalUID: (uid: TUid) => boolean;
}

export interface FlatRTC<
    TUid = number,
    TJoinRoomConfig extends FlatRTCJoinRoomConfigBase<TUid> = FlatRTCJoinRoomConfigBase<TUid>,
> {
    events: FlatRTCEvents;

    destroy(): Promise<void>;

    joinRoom(config: TJoinRoomConfig): Promise<void>;
    leaveRoom(): Promise<void>;

    /** @returns local avatar if uid is not provided */
    getAvatar(uid?: TUid): FlatRTCAvatar;
    getVolumeLevel(uid?: TUid): number;

    setCameraID(deviceId: string): Promise<void>;
    getCameraID(): string | undefined;

    setMicID(deviceId: string): Promise<void>;
    getMicID(): string | undefined;

    setSpeakerID(deviceId: string): Promise<void>;
    getSpeakerID(): string | undefined;

    getCameraDevices(): Promise<FlatRTCDevice[]>;
    getMicDevices(): Promise<FlatRTCDevice[]>;
    getSpeakerDevices(): Promise<FlatRTCDevice[]>;
}

import Emittery from "emittery";
import type { FlatRTCAvatar } from "./avatar";
import type { FlatRTCMode, FlatRTCRole } from "./constants";
import type { FlatRTCDevice } from "./device";
import type { FlatRTCEventData } from "./events";
import type { FlatRTCShareScreen } from "./share-screen";

export interface FlatRTCJoinRoomConfigBase<TUid = number> {
    roomUUID: string;
    uid: TUid;
    mode?: FlatRTCMode;
    role?: FlatRTCRole;
    token?: string | null;
    refreshToken?: (roomUUID: string) => Promise<string>;
    shareScreenUID: TUid;
    shareScreenToken: string;
}

export abstract class FlatRTC<
    TUid = number,
    TJoinRoomConfig extends FlatRTCJoinRoomConfigBase<TUid> = FlatRTCJoinRoomConfigBase<TUid>,
> {
    public readonly events = new Emittery<FlatRTCEventData, FlatRTCEventData>();

    public abstract readonly isJoinedRoom: boolean;

    public abstract readonly shareScreen: FlatRTCShareScreen;

    public abstract destroy(): Promise<void>;

    public abstract joinRoom(config: TJoinRoomConfig): Promise<void>;
    public abstract leaveRoom(): Promise<void>;

    public abstract setRole(role: FlatRTCRole): void;

    /** @returns local avatar if uid is not provided, throws error if uid == shareScreenUID */
    public abstract getAvatar(uid?: TUid): FlatRTCAvatar | undefined;

    public abstract getTestAvatar(): FlatRTCAvatar;

    public abstract getVolumeLevel(uid?: TUid): number;

    public abstract setCameraID(deviceId: string): Promise<void>;
    public abstract getCameraID(): string | undefined;

    public abstract setMicID(deviceId: string): Promise<void>;
    public abstract getMicID(): string | undefined;

    public abstract setSpeakerID(deviceId: string): Promise<void>;
    public abstract getSpeakerID(): string | undefined;

    public abstract getCameraDevices(): Promise<FlatRTCDevice[]>;
    public abstract getMicDevices(): Promise<FlatRTCDevice[]>;
    public abstract getSpeakerDevices(): Promise<FlatRTCDevice[]>;

    /** @returns volume 0~1 */
    public abstract getSpeakerVolume(): number;

    public async setSpeakerVolume(_volume: number): Promise<void> {
        throw doesNotSupportError("setting speaker volume");
    }

    public startNetworkTest(): void {
        throw doesNotSupportError("network probe test");
    }

    public stopNetworkTest(): void {
        throw doesNotSupportError("network probe test");
    }

    public startCameraTest(_el: HTMLElement): void {
        throw doesNotSupportError("camera test");
    }

    public stopCameraTest(): void {
        throw doesNotSupportError("camera test");
    }

    public startMicTest(): void {
        throw doesNotSupportError("microphone test");
    }

    public stopMicTest(): void {
        throw doesNotSupportError("microphone test");
    }

    public startSpeakerTest(_filePath: string): void {
        throw doesNotSupportError("speaker test");
    }

    public stopSpeakerTest(): void {
        throw doesNotSupportError("speaker test");
    }
}

export function doesNotSupportError(type: string): Error {
    return new Error(`Does not support ${type}`);
}

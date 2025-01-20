import { Remitter } from "remitter";
import { SideEffectManager } from "side-effect-manager";
import { IService } from "../typing";
import { IServiceVideoChatMode, IServiceVideoChatRole } from "./constants";
import { IServiceVideoChatEventData } from "./events";
import { IServiceShareScreen } from "./share-screen";
import type { IAgoraRTCRemoteUser, IRemoteAudioTrack } from "agora-rtc-sdk-ng";

export type IServiceVideoChatUID = string;

export interface IServiceVideoChatDevice {
    deviceId: string;
    label: string;
}

export interface IServiceVideoChatAvatar {
    enableCamera(enabled: boolean): void;
    enableMic(enabled: boolean): void;
    setElement(element: HTMLElement | null): void;
    getVolumeLevel(): number;
    destroy(): void;
}

export interface IServiceVideoChatJoinRoomConfig {
    roomUUID: string;
    uid: IServiceVideoChatUID;
    mode?: IServiceVideoChatMode;
    role?: IServiceVideoChatRole;
    token?: string | null;
    refreshToken?: (roomUUID: string) => Promise<string>;
    shareScreenUID: IServiceVideoChatUID;
    shareScreenToken: string;
    mirror?: boolean;
}

export abstract class IServiceVideoChat implements IService {
    protected readonly sideEffect = new SideEffectManager();

    public readonly events = new Remitter<IServiceVideoChatEventData>();

    public abstract readonly isJoinedRoom: boolean;

    // @TODO move share screen to separate service
    public abstract readonly shareScreen: IServiceShareScreen;

    public async destroy(): Promise<void> {
        this.sideEffect.flushAll();
        this.events.destroy();
    }

    public abstract joinRoom(config: IServiceVideoChatJoinRoomConfig): Promise<void>;
    public abstract leaveRoom(): Promise<void>;

    public abstract setRole(role: IServiceVideoChatRole): Promise<void>;

    /** @returns local avatar if uid is not provided, throws error if uid == shareScreenUID */
    public abstract getAvatar(uid?: IServiceVideoChatUID): IServiceVideoChatAvatar | undefined;

    public abstract getTestAvatar(): IServiceVideoChatAvatar;
    public abstract stopTesting(): void;

    public abstract getVolumeLevel(uid?: IServiceVideoChatUID): number;

    public abstract setCameraID(deviceId: string): Promise<void>;
    public abstract getCameraID(): string | undefined;

    public abstract setMicID(deviceId: string): Promise<void>;
    public abstract getMicID(): string | undefined;

    public abstract setSpeakerID(deviceId: string): Promise<void>;
    public abstract getSpeakerID(): string | undefined;

    public abstract getCameraDevices(): Promise<IServiceVideoChatDevice[]>;
    public abstract getMicDevices(): Promise<IServiceVideoChatDevice[]>;
    public abstract getSpeakerDevices(): Promise<IServiceVideoChatDevice[]>;

    /** @returns volume 0~1 */
    public abstract getSpeakerVolume(): number;

    /** only affects local avatar */
    public abstract getMirrorMode(): boolean;
    public abstract setMirrorMode(mirrorMode: boolean): void;

    public abstract listenAIRtcStreamMessage(
        streamMessageHandler: (
            uid: number,
            stream: Uint8Array | number,
            ...arg: any
        ) => Promise<void>,
        userJoinedHandler: (user: Pick<IAgoraRTCRemoteUser, "uid">) => Promise<void>,
        userPublishHandler: (audioTrack: IRemoteAudioTrack) => Promise<void>,
    ): void;

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

    public aiUserUUId: string | undefined;
    public aiAudioTrack?: IRemoteAudioTrack;
    public setAiUserUUId(uuid: string): void {
        this.aiUserUUId = uuid;
    }
}

function doesNotSupportError(type: string): Error {
    return new Error(`Does not support ${type}`);
}

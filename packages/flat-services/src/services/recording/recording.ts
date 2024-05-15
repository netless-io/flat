import type { RoomType } from "@netless/flat-server-api";
import type { ReadonlyVal } from "value-enhancer";
import type { IServiceRecordingEvents } from "./events";

import { Remitter } from "remitter";
import { SideEffectManager } from "side-effect-manager";
import { IService } from "../typing";

export interface IServiceRecording$Val {
    readonly isRecording$: ReadonlyVal<boolean>;
}

export interface IServiceRecordingJoinRoomConfig {
    roomID: string;
    classroomType: RoomType;
}

export abstract class IServiceRecording implements IService {
    public readonly sideEffect = new SideEffectManager();

    public readonly events: IServiceRecordingEvents = new Remitter();

    public abstract readonly $Val: IServiceRecording$Val;

    public abstract readonly roomID: string | null;

    public abstract readonly isRecording: boolean;

    public abstract joinRoom(config: IServiceRecordingJoinRoomConfig): Promise<void>;

    public abstract leaveRoom(): Promise<void>;

    /** Use with try-catch. */
    public abstract startRecording(): Promise<void>;

    /** Refresh `isRecording` state. */
    public abstract checkIsRecording(): Promise<void>;

    /** Use with try-catch. */
    public abstract stopRecording(): Promise<void>;

    public abstract updateLayout(users: Array<{ uid: string; avatar: string }>): Promise<void>;

    public async destroy(): Promise<void> {
        this.events.destroy();
        this.sideEffect.flushAll();
    }
}

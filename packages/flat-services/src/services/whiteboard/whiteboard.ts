import type { Region, RoomType } from "@netless/flat-server-api";
import { Remitter } from "remitter";
import { SideEffectManager } from "side-effect-manager";
import { ReadonlyVal } from "value-enhancer";
import { IService } from "../typing";
import { IServiceWhiteboardPhase } from "./constants";
import { IServiceWhiteboardEvents } from "./events";

export interface IServiceWhiteboardOptions {
    /**
     * true = render stroke tail
     */
    strokeTail?: boolean;
    /**
     * whiteboard ratio, should be the same at all platforms
     */
    ratio?: number;
}

export interface IServiceWhiteboardJoinRoomConfig extends IService {
    appID?: string;
    roomID: string;
    roomToken: string;
    uid: string;
    nickName: string;
    region: Region;
    classroomType: RoomType;
    options?: IServiceWhiteboardOptions;
}

export interface IServiceWhiteboard$Val {
    readonly phase$: ReadonlyVal<IServiceWhiteboardPhase>;
    /** able to write data to whiteboard service */
    readonly isWritable$: ReadonlyVal<boolean>;
    /** able to draw on the whiteboard, requires isWritable = true */
    readonly allowDrawing$: ReadonlyVal<boolean>;
}

export abstract class IServiceWhiteboard {
    public readonly sideEffect = new SideEffectManager();

    public readonly events: IServiceWhiteboardEvents = new Remitter();

    public abstract readonly $Val: IServiceWhiteboard$Val;

    public abstract readonly roomID: string | null;

    public abstract readonly phase: IServiceWhiteboardPhase;

    public abstract readonly isWritable: boolean;

    public abstract readonly allowDrawing: boolean;

    public abstract setIsWritable(isWritable: boolean): void;

    public abstract setAllowDrawing(allowDrawing: boolean): void;

    public abstract joinRoom(config: IServiceWhiteboardJoinRoomConfig): Promise<void>;

    public abstract has(uid: string): boolean;

    public abstract leaveRoom(): Promise<void>;

    public abstract render(el: HTMLElement): void;

    public abstract setTheme(theme: "light" | "dark"): void;

    public abstract exportAnnotations(): Array<Promise<HTMLCanvasElement | null>>;

    public async destroy(): Promise<void> {
        this.events.destroy();
        this.sideEffect.flushAll();
    }
}

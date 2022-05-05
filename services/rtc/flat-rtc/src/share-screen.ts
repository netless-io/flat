import Emittery from "emittery";
import { doesNotSupportError } from "./rtc";

export interface FlatRTCShareScreenData {
    /** When user has published local screen track. */
    "local-changed": boolean;
    /** When someone else has published screen track. */
    "remote-changed": boolean;
    /** When enable() failed. */
    "err-enable": Error;
}

export interface FlatRTCShareScreenParams<TUid = number> {
    uid: TUid;
    token: string;
    roomUUID: string;
}

export abstract class FlatRTCShareScreen<TUid = number> {
    public readonly events = new Emittery<FlatRTCShareScreenData, FlatRTCShareScreenData>();

    public abstract setParams(params: FlatRTCShareScreenParams<TUid> | null): void;
    public abstract enable(enabled: boolean): void;
    public abstract setElement(element: HTMLElement | null): void;
    public abstract destroy(): void;

    public getScreenInfo(): Promise<FlatRTCShareScreenInfo[]> {
        throw doesNotSupportError("screen info");
    }

    public setScreenInfo(_info: FlatRTCShareScreenInfo | null): void {
        throw doesNotSupportError("screen info");
    }
}

// Only used in electron.
export interface FlatRTCShareScreenInfo {
    type: "display" | "window";
    screenId: number;
    name: string;
    image: Uint8Array;
}

import { Remitter } from "remitter";

export type IServiceShareScreenUID = string;

export interface IServiceShareScreenData {
    /** When user has published local screen track. */
    "local-changed": boolean;
    /** When someone else has published screen track. */
    "remote-changed": boolean;
    /** When enable() failed. */
    "err-enable": Error;
}

export interface IServiceShareScreenParams {
    uid: IServiceShareScreenUID;
    token: string;
    roomUUID: string;
}

export abstract class IServiceShareScreen {
    public readonly events = new Remitter<IServiceShareScreenData>();

    public abstract setParams(params: IServiceShareScreenParams | null): void;
    public abstract enable(enabled: boolean, speakerName?: string): void;
    public abstract setElement(element: HTMLElement | null): void;

    public getScreenInfo(): Promise<IServiceShareScreenInfo[]> {
        throw doesNotSupportError("screen info");
    }

    public setScreenInfo(_info: IServiceShareScreenInfo | null): void {
        throw doesNotSupportError("screen info");
    }

    public async destroy(): Promise<void> {
        this.events.destroy();
    }
}

// @TODO
// Only used in electron.
export interface IServiceShareScreenInfo {
    type: "display" | "window";
    screenId: number | { id: number };
    name: string;
    image: Uint8Array;
    width: number;
    height: number;
}

function doesNotSupportError(type: string): Error {
    return new Error(`Does not support ${type}`);
}

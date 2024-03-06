import { Remitter } from "remitter";

export type IServiceWhiteboardKickedReason =
    | "kickedByAdmin"
    | "roomDeleted"
    | "roomBanned"
    | "unknown";

export interface IServiceWhiteboardEventData {
    kicked: IServiceWhiteboardKickedReason;
    exportAnnotations: void;
    insertPresets: void;
    scrollPage: number;
    maxScrollPage: number;
    userScroll: void;
    members: string[];
}

export type IServiceWhiteboardEventName = Extract<keyof IServiceWhiteboardEventData, string>;

export type IServiceWhiteboardEvents = Remitter<IServiceWhiteboardEventData>;

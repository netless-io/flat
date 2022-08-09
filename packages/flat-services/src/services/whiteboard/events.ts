import { Remitter } from "remitter";

export type IServiceWhiteboardKickedReason =
    | "kickedByAdmin"
    | "roomDeleted"
    | "roomBanned"
    | "unknown";

export interface IServiceWhiteboardEventData {
    kicked: IServiceWhiteboardKickedReason;
}

export type IServiceWhiteboardEventName = Extract<keyof IServiceWhiteboardEventData, string>;

export type IServiceWhiteboardEvents = Remitter<IServiceWhiteboardEventData>;

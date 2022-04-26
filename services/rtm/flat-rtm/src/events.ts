import Emittery from "emittery";

export interface FlatRTMEventData {
    "remote-login": { roomUUID: string };
    "room-message": {
        roomUUID: string;
        uuid: string;
        timestamp: number;
        text: string;
        senderID: string;
    };
    ban: {
        roomUUID: string;
        uuid: string;
        timestamp: number;
        status: boolean;
        senderID: string;
    };
    notice: {
        roomUUID: string;
        uuid: string;
        timestamp: number;
        text: string;
        senderID: string;
    };
    "raise-hand": { roomUUID: string; userUUID: string };
    "on-stage": { roomUUID: string; onStage: boolean; senderID: string };
    "member-joined": { roomUUID: string; userUUID: string };
    "member-left": { roomUUID: string; userUUID: string };
}

export type FlatRTMEventNames = keyof FlatRTMEventData;

export type FlatRTMEvents = Emittery<FlatRTMEventData, FlatRTMEventData>;

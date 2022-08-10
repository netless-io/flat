import { Remitter } from "remitter";

export interface IServiceTextChatEventData {
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
    "raise-hand": { roomUUID: string; userUUID: string; raiseHand: boolean };
    "member-joined": { roomUUID: string; userUUID: string };
    "member-left": { roomUUID: string; userUUID: string };
}

export type IServiceTextChatEventNames = Extract<keyof IServiceTextChatEventData, string>;

export type IServiceTextChatEvents = Remitter<IServiceTextChatEventData>;

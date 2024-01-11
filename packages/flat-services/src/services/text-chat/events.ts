import type { RoomStatus, UserInfo } from "@netless/flat-server-api";
import type { Remitter } from "remitter";

export interface IServiceTextChatEventData {
    "remote-login": { roomUUID: string };
    "room-message": {
        roomUUID: string;
        uuid: string;
        timestamp: number;
        text: string;
        senderID: string;
    };
    "admin-message": {
        roomUUID: string;
        uuid: string;
        timestamp: number;
        text: string;
        senderID: string;
    };
    "ban": {
        roomUUID: string;
        uuid: string;
        timestamp: number;
        status: boolean;
        senderID: string;
    };
    "notice": {
        roomUUID: string;
        uuid: string;
        timestamp: number;
        text: string;
        senderID: string;
    };
    "reward": {
        roomUUID: string;
        userUUID: string;
        senderID: string;
    };
    "raise-hand": { roomUUID: string; userUUID: string; raiseHand: boolean };
    "member-joined": { roomUUID: string; userUUID: string };
    "member-left": { roomUUID: string; userUUID: string };
    "update-room-status": { roomUUID: string; status: RoomStatus; senderID: string };
    "request-device": {
        roomUUID: string;
        senderID: string;
        deviceState: { camera?: boolean; mic?: boolean };
    };
    "request-device-response": {
        roomUUID: string;
        userUUID: string;
        deviceState: { camera?: boolean; mic?: boolean };
    };
    "notify-device-off": {
        roomUUID: string;
        senderID: string;
        deviceState: { camera?: boolean; mic?: boolean };
    };
    "enter": {
        roomUUID: string;
        userUUID: string;
        userInfo: UserInfo;
        peers?: string[];
    };
    "users-info": { roomUUID: string; userUUID: string; users: Record<string, UserInfo> };
}

export type IServiceTextChatEventNames = Extract<keyof IServiceTextChatEventData, string>;

export type IServiceTextChatEvents = Remitter<IServiceTextChatEventData>;

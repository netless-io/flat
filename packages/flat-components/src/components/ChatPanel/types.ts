import type { FlatRTMEventData } from "@netless/flat-rtm";

export type ChatMsgType = "notice" | "ban" | "room-message" | "user-guide";

export type ChatMsgRoomMessage = { type: "room-message" } & FlatRTMEventData["room-message"];

export type ChatMsgNotice = { type: "notice" } & FlatRTMEventData["notice"];

export type ChatMsgBan = { type: "ban" } & FlatRTMEventData["ban"];

export type ChatMsgUserGuide = {
    type: "user-guide";
    roomUUID: string;
    uuid: string;
    timestamp: number;
    senderID: string;
};

export type ChatMsg = ChatMsgRoomMessage | ChatMsgNotice | ChatMsgBan | ChatMsgUserGuide;

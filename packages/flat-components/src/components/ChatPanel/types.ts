import type { IServiceTextChatEventData } from "@netless/flat-services";

export type ChatMsgType = "notice" | "ban" | "room-message" | "user-guide";

export type ChatMsgRoomMessage = {
    type: "room-message";
} & IServiceTextChatEventData["room-message"];

export type ChatMsgNotice = { type: "notice" } & IServiceTextChatEventData["notice"];

export type ChatMsgBan = { type: "ban" } & IServiceTextChatEventData["ban"];

export type ChatMsgUserGuide = {
    type: "user-guide";
    roomUUID: string;
    uuid: string;
    timestamp: number;
    senderID: string;
};

export type AIChatMsgUser = ChatMsgRoomMessage & {
    isFinal: boolean;
};

export type ChatMsg =
    | ChatMsgRoomMessage
    | ChatMsgNotice
    | ChatMsgBan
    | ChatMsgUserGuide
    | AIChatMsgUser;

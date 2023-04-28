import type { RoomStatus } from "@netless/flat-server-api";

/** From teacher to students */
export interface IServiceTextChatRoomCommandData {
    "update-room-status": { roomUUID: string; status: RoomStatus };
    "ban": { roomUUID: string; status: boolean };
    "notice": { roomUUID: string; text: string };
    "reward": { roomUUID: string; userUUID: string };
}

export type IServiceTextChatRoomCommandNames = keyof IServiceTextChatRoomCommandData;

export type IServiceTextChatRoomCommand<
    TName extends IServiceTextChatRoomCommandNames = IServiceTextChatRoomCommandNames,
> = TName extends IServiceTextChatRoomCommandNames
    ? { t: TName; v: IServiceTextChatRoomCommandData[TName] }
    : never;

export interface IServiceTextChatPeerCommandData {
    /** From student to teacher */
    "raise-hand": { roomUUID: string; raiseHand: boolean };
    /** From teacher to student */
    "request-device": { roomUUID: string; camera?: true; mic?: true };
    /** From student to teacher */
    "request-device-response": { roomUUID: string; camera?: boolean; mic?: boolean };
    /** From teacher to student */
    "notify-device-off": { roomUUID: string; camera?: false; mic?: false };
}

export type IServiceTextChatPeerCommandNames = keyof IServiceTextChatPeerCommandData;

export type IServiceTextChatPeerCommand<
    TName extends IServiceTextChatPeerCommandNames = IServiceTextChatPeerCommandNames,
> = TName extends IServiceTextChatPeerCommandNames
    ? { t: TName; v: IServiceTextChatPeerCommandData[TName] & { roomUUID: string } }
    : never;

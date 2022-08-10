export interface IServiceTextChatRoomCommandData {
    ban: { roomUUID: string; status: boolean };
    notice: { roomUUID: string; text: string };
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
}

export type IServiceTextChatPeerCommandNames = keyof IServiceTextChatPeerCommandData;

export type IServiceTextChatPeerCommand<
    TName extends IServiceTextChatPeerCommandNames = IServiceTextChatPeerCommandNames,
> = TName extends IServiceTextChatPeerCommandNames
    ? { t: TName; v: IServiceTextChatPeerCommandData[TName] & { roomUUID: string } }
    : never;

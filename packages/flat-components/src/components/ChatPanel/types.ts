export enum ChatMsgType {
    Notice = "Notice",
    BanText = "BanText",
    ChannelMessage = "ChannelMessage",
    UserGuide = "UserGuide",
}

export type ChatMsg = {
    uuid: string;
    type: string;
    value: string | boolean;
    userUUID: string;
    timestamp: number;
};

import { ButtonProps } from "antd";

export type RoomStatusType = "upcoming" | "running" | "paused" | "stopped";

export interface RoomListItemAction<TKey extends string = string> {
    key: TKey;
    text: string;
    disabled?: boolean;
}

export interface RoomListItemPrimaryAction<TKey extends string = string>
    extends RoomListItemAction<TKey> {
    type?: ButtonProps["type"];
}

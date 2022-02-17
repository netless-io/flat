import { Button, Dropdown, Menu } from "antd";
import React from "react";

export interface RoomListItemButton<TKey extends string = string> {
    key: TKey;
    text: string;
    disabled?: boolean;
}
export type RoomListItemButtons<TKey extends string = string> = Array<
    RoomListItemButton<TKey> | Array<RoomListItemButton<TKey>>
>;

export interface RoomListItemButtonsProps<TKey extends string = string> {
    buttons: RoomListItemButtons<TKey>;
    onClickMenu?: (key: TKey) => void;
}

export function RoomListItemButtonList<TKey extends string = string>({
    buttons,
    onClickMenu,
}: React.PropsWithChildren<RoomListItemButtonsProps<TKey>>): React.ReactElement | null {
    return (
        <>
            {buttons.map(buttonConfig => {
                if (Array.isArray(buttonConfig)) {
                    return (
                        <Dropdown
                            key={buttonConfig.map(button => button.key).join("-")}
                            overlay={
                                <Menu>
                                    {buttonConfig.map(button => (
                                        <Menu.Item
                                            key={button.key}
                                            onClick={() => onClickMenu?.(button.key)}
                                        >
                                            {button.text}
                                        </Menu.Item>
                                    ))}
                                </Menu>
                            }
                            overlayClassName="room-list-item-sub-menu"
                            trigger={["click"]}
                        >
                            <Button className="room-list-item-more">...</Button>
                        </Dropdown>
                    );
                } else {
                    return (
                        <Button
                            key={buttonConfig.key}
                            disabled={buttonConfig.disabled}
                            type="primary"
                            onClick={() => onClickMenu?.(buttonConfig.key)}
                        >
                            {buttonConfig.text}
                        </Button>
                    );
                }
            })}
        </>
    );
}

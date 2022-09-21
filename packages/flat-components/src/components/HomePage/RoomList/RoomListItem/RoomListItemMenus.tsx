import { Button, Dropdown, Menu } from "antd";
import React from "react";
import { SVGMore } from "../../../FlatIcons";
import { RoomListItemAction } from "./types";

export interface RoomListItemMenusProps<TKey extends string = string> {
    actions: Array<RoomListItemAction<TKey>>;
    onAction: (key: TKey) => void;
}

export function RoomListItemMenus<TKey extends string = string>({
    actions,
    onAction,
}: React.PropsWithChildren<RoomListItemMenusProps<TKey>>): React.ReactElement | null {
    return (
        <Dropdown
            overlay={
                <Menu
                    items={actions.map(action => ({
                        key: action.key,
                        onClick: () => onAction(action.key),
                        label: action.text,
                    }))}
                />
            }
            overlayClassName="room-list-item-sub-menu"
            trigger={["click"]}
        >
            <Button className="room-list-item-more" type="text">
                <SVGMore />
            </Button>
        </Dropdown>
    );
}

import { Menu } from "antd";
import { MenuItemProps } from "antd/lib/menu/MenuItem";
import { observer } from "mobx-react-lite";
import React from "react";
import { RoomItem, roomStore } from "../../stores/RoomStore";

interface DeleteRoomHistoryItemProps extends MenuItemProps {
    room: RoomItem | undefined;
    handleClick?: () => void;
}

export const DeleteRoomHistoryItem = observer<DeleteRoomHistoryItemProps>(
    function DeleteRoomHistoryItem({ room, handleClick, onClick, ...restProps }) {
        if (!room?.roomUUID) {
            return null;
        }

        return (
            <Menu.Item
                {...restProps}
                onClick={async e => {
                    if (handleClick) {
                        handleClick();
                    }

                    if (onClick) {
                        onClick(e);
                    }

                    try {
                        await roomStore.cancelRoom({
                            isHistory: true,
                            roomUUID: room?.roomUUID,
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }}
            >
                删除记录
            </Menu.Item>
        );
    },
);

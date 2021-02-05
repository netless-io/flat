import { Menu } from "antd";
import { observer } from "mobx-react-lite";
import React from "react";
import { RoomItem, roomStore } from "../../stores/RoomStore";

interface DeleteRoomHistoryItemProps {
    room: RoomItem | undefined;
    handleClick?: () => void;
}

export const DeleteRoomHistoryItem = observer<DeleteRoomHistoryItemProps>(
    function DeleteRoomHistoryItem({ room, handleClick, ...restProps }) {
        if (!room?.roomUUID) {
            return null;
        }

        return (
            <Menu.Item
                {...restProps}
                onClick={async () => {
                    if (handleClick) {
                        handleClick();
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

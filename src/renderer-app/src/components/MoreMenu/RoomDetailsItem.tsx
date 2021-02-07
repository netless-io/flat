import { Menu } from "antd";
import { MenuItemProps } from "antd/lib/menu/MenuItem";
import { observer } from "mobx-react-lite";
import React from "react";
import { RoomItem } from "../../stores/RoomStore";
import { RouteNameType, usePushHistory } from "../../utils/routes";

interface RoomDetailsItemProps extends MenuItemProps {
    room: RoomItem | undefined;
    handleClick?: () => void;
}

export const RoomDetailsItem = observer<RoomDetailsItemProps>(function DeleteRoomHistoryItem({
    room,
    handleClick,
    onClick,
    ...restProps
}) {
    const pushHistory = usePushHistory();

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

                pushHistory(RouteNameType.RoomDetailPage, {
                    roomUUID: room?.roomUUID,
                    periodicUUID: room?.periodicUUID,
                });
            }}
        >
            房间详情
        </Menu.Item>
    );
});

import React from "react";
import { Menu } from "antd";
import { observer } from "mobx-react-lite";
import { RoomItem, roomStore } from "../../stores/RoomStore";
import { RouteNameType, usePushHistory } from "../../utils/routes";

interface RoomDetailsItemProps {
    room: RoomItem | undefined;
    handleClick?: () => void;
}

export const RoomDetailsItem = observer<RoomDetailsItemProps>(function DeleteRoomHistoryItem({
    room,
    handleClick,
    ...restProps
}) {
    const pushHistory = usePushHistory();

    if (!room?.roomUUID) {
        return <></>;
    }

    return (
        <Menu.Item
            {...restProps}
            onClick={async () => {
                if (handleClick) {
                    handleClick();
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

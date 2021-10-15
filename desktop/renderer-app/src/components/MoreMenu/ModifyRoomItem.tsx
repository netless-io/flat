import { Menu } from "antd";
import { MenuItemProps } from "antd/lib/menu/MenuItem";
import { observer } from "mobx-react-lite";
import React from "react";
import { RoomStatus } from "../../api-middleware/flatServer/constants";
import { RouteNameType } from "../../route-config";
import { RoomItem } from "../../stores/room-store";
import { usePushHistory } from "../../utils/routes";

interface ModifyRoomItemProps extends MenuItemProps {
    room: RoomItem | undefined;
    isCreator: boolean;
    handleClick?: () => void;
    autoJumpRouter?: boolean;
}

export const ModifyRoomItem = observer<ModifyRoomItemProps>(function ModifyButton({
    room,
    isCreator,
    handleClick,
    onClick,
    autoJumpRouter = true,
    ...restProps
}) {
    const pushHistory = usePushHistory();

    if (!room?.roomUUID && !room?.periodicUUID) {
        return null;
    }

    if (!isCreator || room?.roomStatus !== RoomStatus.Idle) {
        return null;
    }

    return (
        <Menu.Item
            {...restProps}
            onClick={e => {
                if (handleClick) {
                    handleClick();
                }

                if (onClick) {
                    onClick(e);
                }

                if (autoJumpRouter) {
                    pushHistory(RouteNameType.ModifyOrdinaryRoomPage, {
                        roomUUID: room?.roomUUID,
                        periodicUUID: room?.periodicUUID,
                    });
                }
            }}
        >
            修改房间
        </Menu.Item>
    );
});

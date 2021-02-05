import { Menu } from "antd";
import { observer } from "mobx-react-lite";
import React from "react";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import { RouteNameType } from "../../route-config";
import { RoomItem } from "../../stores/RoomStore";
import { usePushHistory } from "../../utils/routes";

interface ModifyRoomItemProps {
    room: RoomItem | undefined;
    isCreator: boolean;
    handleClick?: () => void;
    autoJumpRouter?: boolean;
}

export const ModifyRoomItem = observer<ModifyRoomItemProps>(function ModifyButton({
    room,
    isCreator,
    handleClick,
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
            onClick={() => {
                if (handleClick) {
                    handleClick();
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

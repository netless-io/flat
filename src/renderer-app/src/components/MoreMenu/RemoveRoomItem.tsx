import { Menu } from "antd";
import { MenuItemProps } from "antd/lib/menu/MenuItem";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import { RoomItem } from "../../stores/RoomStore";
import { RemoveRoomModal } from "../Modal/RemoveRoomModal";

interface RemoveRoomItemProps extends MenuItemProps {
    room: RoomItem | undefined;
    isCreator: boolean;
    onRemoveRoom?: (roomUUID: string | undefined) => void;
    autoPopupModal?: boolean;
    isPeriodicDetailsPage: boolean;
}

export const RemoveRoomItem = observer<RemoveRoomItemProps>(function RemoveButton({
    isCreator,
    room,
    onRemoveRoom,
    onClick,
    isPeriodicDetailsPage,
    ...restProps
}) {
    const [cancelModalVisible, setCancelModalVisible] = useState(false);

    if (isCreator && room?.roomStatus !== RoomStatus.Idle) {
        return null;
    }

    const title = isCreator ? "取消房间" : "移除房间";

    const hideCancelModal = (): void => {
        setCancelModalVisible(false);
    };

    return (
        <>
            <Menu.Item
                {...restProps}
                onClick={e => {
                    if (onClick) {
                        onClick(e);
                    }
                    setCancelModalVisible(true);
                }}
            >
                {title}
            </Menu.Item>
            <RemoveRoomModal
                cancelModalVisible={cancelModalVisible}
                onCancel={hideCancelModal}
                isCreator={isCreator}
                onRemoveRoom={onRemoveRoom}
                roomUUID={room?.roomUUID}
                periodicUUID={room?.periodicUUID}
                isPeriodicDetailsPage={isPeriodicDetailsPage}
            />
        </>
    );
});

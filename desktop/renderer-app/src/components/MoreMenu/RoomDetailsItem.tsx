import { Menu } from "antd";
import { MenuItemProps } from "antd/lib/menu/MenuItem";
import { observer } from "mobx-react-lite";
import React from "react";
import { RoomItem } from "../../stores/room-store";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const pushHistory = usePushHistory();

    if (!room?.roomUUID) {
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

                pushHistory(RouteNameType.RoomDetailPage, {
                    roomUUID: room?.roomUUID,
                    periodicUUID: room?.periodicUUID,
                });
            }}
        >
            {t("room-detail")}
        </Menu.Item>
    );
});

import { Menu } from "antd";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { MenuItemProps } from "antd/lib/menu/MenuItem";
import { InviteModal } from "../Modal/InviteModal";
import { RoomItem } from "../../stores/RoomStore";

interface CopyInvitationItemProps extends MenuItemProps {
    room: RoomItem | undefined;
    handleClick?: () => void;
}

export const CopyInvitationItem = observer<CopyInvitationItemProps>(function DeleteRoomHistoryItem({
    room,
    onClick,
    handleClick,
    ...restProps
}) {
    const [isShowInviteModal, setIsShowInviteModal] = useState(false);
    if (!room?.roomUUID) {
        return null;
    }

    return (
        <>
            <Menu.Item
                {...restProps}
                onClick={async e => {
                    if (handleClick) {
                        handleClick();
                    }

                    if (onClick) {
                        onClick(e);
                    }

                    setIsShowInviteModal(true);
                }}
            >
                复制邀请
            </Menu.Item>
            <InviteModal
                visible={isShowInviteModal}
                room={room}
                onCancel={() => {
                    setIsShowInviteModal(false);
                }}
            />
        </>
    );
});

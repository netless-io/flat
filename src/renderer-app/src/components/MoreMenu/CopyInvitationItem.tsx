import { Menu, message } from "antd";
import { clipboard } from "electron";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { InviteModal } from "../Modal/InviteModal";
import { RoomItem } from "../../stores/RoomStore";

interface CopyInvitationItemProps {
    room: RoomItem | undefined;
    handleClick?: () => void;
}

export const CopyInvitationItem = observer<CopyInvitationItemProps>(function DeleteRoomHistoryItem({
    room,
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
                onClick={async () => {
                    if (handleClick) {
                        handleClick();
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

import React, { useState } from "react";
import { Menu, message } from "antd";
import { observer } from "mobx-react-lite";
import { RoomItem } from "../../stores/RoomStore";
import { InviteModal } from "../../pages/RoomDetailPage/InviteModal";
import { clipboard } from "electron";

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
        return <></>;
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
                onCopy={() => {
                    clipboard.writeText(room?.roomUUID);
                    message.success("复制成功");
                }}
                onCancel={() => {
                    setIsShowInviteModal(false);
                }}
            />
        </>
    );
});

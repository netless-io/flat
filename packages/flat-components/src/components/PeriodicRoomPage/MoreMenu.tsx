import moreMenuSVG from "./icons/more-menu.svg";

import React, { useState } from "react";
import { Dropdown, Menu } from "antd";
import MenuItem from "antd/lib/menu/MenuItem";
import { RoomInfo } from "../../types/room";
import { InviteModal } from "../InviteModal";
import { RemoveRoomModal } from "../RemoveRoomModal";

export interface MoreMenuProps {
    room: RoomInfo;
    userName: string;
    isCreator: boolean;
    onCopy: () => void;
    onRemoveRoom: () => void;
    jumpToRoomInfoPage: () => void;
    jumpToModifyRoomPage: () => void;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({
    room,
    userName,
    isCreator,
    onCopy,
    onRemoveRoom,
    jumpToRoomInfoPage,
    jumpToModifyRoomPage,
}) => {
    const [removeRoomVisible, setRemoveRoomVisible] = useState(false);
    const [inviteRoomVisible, setInviteRoomVisible] = useState(false);

    return (
        <Dropdown
            overlay={() => {
                return (
                    <Menu>
                        <MenuItem onClick={jumpToRoomInfoPage}>房间详情</MenuItem>
                        {isCreator && (
                            <>
                                <MenuItem onClick={jumpToModifyRoomPage}>修改房间</MenuItem>
                                <MenuItem onClick={() => setRemoveRoomVisible(true)}>
                                    取消房间
                                </MenuItem>
                            </>
                        )}
                        <MenuItem onClick={() => setInviteRoomVisible(true)}>复制邀请</MenuItem>
                        <RemoveRoomModal
                            cancelModalVisible={removeRoomVisible}
                            isCreator={isCreator}
                            onCancel={() => setRemoveRoomVisible(false)}
                            onCancelRoom={onRemoveRoom}
                            isPeriodicDetailsPage={false}
                        />
                        <InviteModal
                            visible={inviteRoomVisible}
                            room={room}
                            userName={userName}
                            onCopy={onCopy}
                            onCancel={() => setInviteRoomVisible(false)}
                        />
                    </Menu>
                );
            }}
            trigger={["click"]}
        >
            <img src={moreMenuSVG} alt="更多" />
        </Dropdown>
    );
};

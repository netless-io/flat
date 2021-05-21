import moreMenuSVG from "./icons/more-menu.svg";

import React, { useState } from "react";
import { Dropdown, Menu, message } from "antd";
import MenuItem from "antd/lib/menu/MenuItem";
import { RoomInfo } from "../../types/room";
import { InviteModal } from "../InviteModal";
import { CancelSubPeriodicRoomModal } from "./CancelSubPeriodicRoomModal";

export interface MoreMenuProps {
    room: RoomInfo;
    userName: string;
    isCreator: boolean;
    onCopyInvitation: (text: string) => void;
    onCancelSubPeriodicRoom: () => void;
    jumpToRoomDetailPage: () => void;
    jumpToModifyOrdinaryRoomPage: () => void;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({
    room,
    userName,
    isCreator,
    onCopyInvitation,
    onCancelSubPeriodicRoom,
    jumpToRoomDetailPage,
    jumpToModifyOrdinaryRoomPage,
}) => {
    const [cancelSubPeriodicRoomVisible, setCancelSubPeriodicRoomVisible] = useState(false);
    const [inviteRoomVisible, setInviteRoomVisible] = useState(false);

    return (
        <Dropdown
            overlay={() => {
                return (
                    <Menu>
                        <MenuItem onClick={jumpToRoomDetailPage}>房间详情</MenuItem>
                        {isCreator && (
                            <>
                                <MenuItem onClick={jumpToModifyOrdinaryRoomPage}>修改房间</MenuItem>
                                <MenuItem onClick={() => setCancelSubPeriodicRoomVisible(true)}>
                                    取消房间
                                </MenuItem>
                            </>
                        )}
                        <MenuItem onClick={() => setInviteRoomVisible(true)}>复制邀请</MenuItem>
                        <CancelSubPeriodicRoomModal
                            visible={cancelSubPeriodicRoomVisible}
                            isCreator={isCreator}
                            onCancel={() => setCancelSubPeriodicRoomVisible(false)}
                            onCancelSubPeriodicRoom={onCancelSubPeriodicRoom}
                        />
                        <InviteModal
                            visible={inviteRoomVisible}
                            room={room}
                            userName={userName}
                            onCopy={text => {
                                onCopyInvitation(text);
                                message.success("复制成功");
                                setInviteRoomVisible(false);
                            }}
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

import moreMenuSVG from "./icons/more-menu.svg";

import React, { useState } from "react";
import { Dropdown, Menu, message } from "antd";
import { RoomInfo } from "../../types/room";
import { InviteModal } from "../InviteModal";
import { CancelSubPeriodicRoomModal } from "./CancelSubPeriodicRoomModal";

export interface MoreMenuProps {
    room: RoomInfo;
    userName: string;
    inviteBaseUrl: string;
    isCreator: boolean;
    onCopyInvitation: (text: string) => void;
    onCancelSubPeriodicRoom: () => void;
    jumpToRoomDetailPage: () => void;
    jumpToModifyOrdinaryRoomPage: () => void;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({
    room,
    userName,
    inviteBaseUrl,
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
                        <Menu.Item onClick={jumpToRoomDetailPage}>房间详情</Menu.Item>
                        {isCreator && (
                            <>
                                <Menu.Item onClick={jumpToModifyOrdinaryRoomPage}>
                                    修改房间
                                </Menu.Item>
                                <Menu.Item onClick={() => setCancelSubPeriodicRoomVisible(true)}>
                                    取消房间
                                </Menu.Item>
                            </>
                        )}
                        <Menu.Item onClick={() => setInviteRoomVisible(true)}>复制邀请</Menu.Item>
                        <CancelSubPeriodicRoomModal
                            visible={cancelSubPeriodicRoomVisible}
                            isCreator={isCreator}
                            onCancel={() => setCancelSubPeriodicRoomVisible(false)}
                            onCancelSubPeriodicRoom={onCancelSubPeriodicRoom}
                        />
                        <InviteModal
                            visible={inviteRoomVisible}
                            room={room}
                            baseUrl={inviteBaseUrl}
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

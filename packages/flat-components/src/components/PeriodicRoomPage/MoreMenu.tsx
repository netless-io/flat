import moreMenuSVG from "./icons/more-menu.svg";

import React, { useState } from "react";
import { Dropdown, Menu, message } from "antd";
import { RoomInfo } from "../../types/room";
import { InviteModal } from "../InviteModal";
import { CancelSubPeriodicRoomModal } from "./CancelSubPeriodicRoomModal";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const [cancelSubPeriodicRoomVisible, setCancelSubPeriodicRoomVisible] = useState(false);
    const [inviteRoomVisible, setInviteRoomVisible] = useState(false);

    return (
        <Dropdown
            overlay={() => {
                return (
                    <Menu>
                        <Menu.Item onClick={jumpToRoomDetailPage}>{t("room-detail")}</Menu.Item>
                        {isCreator && (
                            <>
                                <Menu.Item onClick={jumpToModifyOrdinaryRoomPage}>
                                    {t("modify-room")}
                                </Menu.Item>
                                <Menu.Item onClick={() => setCancelSubPeriodicRoomVisible(true)}>
                                    {t("cancel-room")}
                                </Menu.Item>
                            </>
                        )}
                        <Menu.Item onClick={() => setInviteRoomVisible(true)}>
                            {t("copy-invitation")}
                        </Menu.Item>
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
                                message.success(t("copy-success"));
                                setInviteRoomVisible(false);
                            }}
                            onCancel={() => setInviteRoomVisible(false)}
                        />
                    </Menu>
                );
            }}
            trigger={["click"]}
        >
            <img src={moreMenuSVG} alt={t("more")} />
        </Dropdown>
    );
};

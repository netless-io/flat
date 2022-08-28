import moreMenuSVG from "./icons/more-menu.svg";

import React, { useState } from "react";
import { Dropdown, Menu, message } from "antd";
import { RoomInfo } from "../../types/room";
import { InviteModal } from "../InviteModal";
import { CancelSubPeriodicRoomModal } from "./CancelSubPeriodicRoomModal";
import { useTranslate } from "@netless/flat-i18n";

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
    const t = useTranslate();
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
                            {t("invitation")}
                        </Menu.Item>
                        <CancelSubPeriodicRoomModal
                            isCreator={isCreator}
                            visible={cancelSubPeriodicRoomVisible}
                            onCancel={() => setCancelSubPeriodicRoomVisible(false)}
                            onCancelSubPeriodicRoom={onCancelSubPeriodicRoom}
                        />
                        <InviteModal
                            baseUrl={inviteBaseUrl}
                            room={room}
                            userName={userName}
                            visible={inviteRoomVisible}
                            onCancel={() => setInviteRoomVisible(false)}
                            onCopy={text => {
                                onCopyInvitation(text);
                                void message.success(t("copy-success"));
                                setInviteRoomVisible(false);
                            }}
                        />
                    </Menu>
                );
            }}
            trigger={["click"]}
        >
            <img alt={t("more")} src={moreMenuSVG} />
        </Dropdown>
    );
};

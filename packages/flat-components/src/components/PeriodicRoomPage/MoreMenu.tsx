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
    isPmi?: boolean;
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
    isPmi,
    onCopyInvitation,
    onCancelSubPeriodicRoom,
    jumpToRoomDetailPage,
    jumpToModifyOrdinaryRoomPage,
}) => {
    const t = useTranslate();
    const [cancelSubPeriodicRoomVisible, setCancelSubPeriodicRoomVisible] = useState(false);
    const [inviteRoomVisible, setInviteRoomVisible] = useState(false);

    return (
        <>
            <Dropdown
                overlay={() => {
                    return (
                        <Menu
                            items={[
                                {
                                    key: "room-detail",
                                    label: t("room-detail"),
                                    onClick: jumpToRoomDetailPage,
                                },
                                ...(isCreator
                                    ? [
                                          {
                                              key: "modify-room",
                                              label: t("modify-room"),
                                              onClick: jumpToModifyOrdinaryRoomPage,
                                          },
                                          {
                                              key: "cancel-room",
                                              label: t("cancel-room"),
                                              onClick: () => setCancelSubPeriodicRoomVisible(true),
                                          },
                                      ]
                                    : []),
                                ...((!room.isAI && [
                                    {
                                        key: "invitation",
                                        label: t("invitation"),
                                        onClick: () => setInviteRoomVisible(true),
                                    },
                                ]) ||
                                    []),
                            ]}
                        />
                    );
                }}
                trigger={["click"]}
            >
                <button className="periodic-room-panel-more-btn">
                    <img alt={t("more")} src={moreMenuSVG} />
                </button>
            </Dropdown>
            <CancelSubPeriodicRoomModal
                isCreator={isCreator}
                visible={cancelSubPeriodicRoomVisible}
                onCancel={() => setCancelSubPeriodicRoomVisible(false)}
                onCancelSubPeriodicRoom={onCancelSubPeriodicRoom}
            />
            <InviteModal
                baseUrl={inviteBaseUrl}
                isPmi={isPmi}
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
        </>
    );
};

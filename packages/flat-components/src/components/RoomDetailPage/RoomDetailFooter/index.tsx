import "./index.less";

import React, { useState } from "react";
import { Button, message } from "antd";
import { observer } from "mobx-react-lite";
import { RoomInfo, RoomStatus, Week } from "../../../types/room";
import { InviteModal } from "../../InviteModal";
import { RemoveRoomModal } from "../../RemoveRoomModal";
import { useTranslate } from "@netless/flat-i18n";

export interface RoomDetailFooterProps {
    room: RoomInfo;
    userName: string;
    isCreator: boolean;
    isPeriodicDetailsPage: boolean;
    inviteBaseUrl: string;
    // repeated weeks for periodic rooms
    periodicWeeks?: Week[];
    isPmi?: boolean;
    onJoinRoom: () => void;
    onReplayRoom: () => void;
    onModifyRoom: () => void;
    onCancelRoom: (all: boolean) => void;
    onCopyInvitation: (text: string) => void;
}

export const RoomDetailFooter = /* @__PURE__ */ observer<RoomDetailFooterProps>(
    function RoomDetailFooter({
        room,
        userName,
        inviteBaseUrl,
        isCreator,
        isPeriodicDetailsPage,
        periodicWeeks,
        isPmi,
        onJoinRoom,
        onReplayRoom,
        onModifyRoom,
        onCancelRoom,
        onCopyInvitation,
    }) {
        const t = useTranslate();
        const [cancelModalVisible, setCancelModalVisible] = useState(false);
        const [isShowInviteModal, setIsShowInviteModal] = useState(false);
        const hideInviteModal = (): void => setIsShowInviteModal(false);

        if (room.roomStatus === RoomStatus.Stopped) {
            return (
                <div className="room-detail-footer-btn-container">
                    <Button
                        className="room-detail-footer-btn"
                        disabled={!room.hasRecord}
                        onClick={onReplayRoom}
                    >
                        {t("view-replay")}
                    </Button>
                </div>
            );
        }

        const disabled = !isCreator || room.roomStatus === RoomStatus.Idle;
        const title = isCreator ? t("cancel-room") : t("remove-room");

        return (
            <div className="room-detail-footer-btn-container">
                <Button
                    danger
                    className="room-detail-footer-btn"
                    disabled={!disabled}
                    onClick={() => setCancelModalVisible(true)}
                >
                    {title}
                </Button>
                {isCreator && (
                    <Button
                        className="room-detail-footer-btn"
                        disabled={!disabled}
                        onClick={onModifyRoom}
                    >
                        {t("modify-room")}
                    </Button>
                )}
                {!room.isAI && (
                    <Button
                        className="room-detail-footer-btn"
                        onClick={() => setIsShowInviteModal(true)}
                    >
                        {t("invitation")}
                    </Button>
                )}
                <Button className="room-detail-footer-btn" type="primary" onClick={onJoinRoom}>
                    {t("join-room")}
                </Button>
                <InviteModal
                    baseUrl={inviteBaseUrl}
                    isPmi={isPmi}
                    periodicWeeks={periodicWeeks}
                    room={room}
                    userName={userName}
                    visible={isShowInviteModal}
                    onCancel={hideInviteModal}
                    onCopy={text => {
                        onCopyInvitation(text);
                        void message.success(t("copy-success"));
                        hideInviteModal();
                    }}
                />
                <RemoveRoomModal
                    cancelModalVisible={cancelModalVisible}
                    isCreator={isCreator}
                    isPeriodicDetailsPage={isPeriodicDetailsPage}
                    periodicUUID={room?.periodicUUID}
                    roomUUID={room?.roomUUID}
                    onCancel={() => setCancelModalVisible(false)}
                    onCancelRoom={onCancelRoom}
                />
            </div>
        );
    },
);

import "./index.less";

import React, { useState } from "react";
import { Button, message } from "antd";
import { observer } from "mobx-react-lite";
import { RoomInfo, RoomStatus, Week } from "../../../types/room";
import { InviteModal } from "../../InviteModal";
import { RemoveRoomModal } from "../../RemoveRoomModal";
import { useTranslation } from "react-i18next";

export interface RoomDetailFooterProps {
    room: RoomInfo;
    userName: string;
    isCreator: boolean;
    isPeriodicDetailsPage: boolean;
    inviteBaseUrl: string;
    // repeated weeks for periodic rooms
    periodicWeeks?: Week[];
    onJoinRoom: () => void;
    onReplayRoom: () => void;
    onModifyRoom: () => void;
    onCancelRoom: (all: boolean) => void;
    onCopyInvitation: (text: string) => void;
}

export const RoomDetailFooter = observer<RoomDetailFooterProps>(function RoomDetailFooter({
    room,
    userName,
    inviteBaseUrl,
    isCreator,
    isPeriodicDetailsPage,
    periodicWeeks,
    onJoinRoom,
    onReplayRoom,
    onModifyRoom,
    onCancelRoom,
    onCopyInvitation,
}) {
    const { t } = useTranslation();
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [isShowInviteModal, setIsShowInviteModal] = useState(false);
    const hideInviteModal = (): void => setIsShowInviteModal(false);

    if (room.roomStatus === RoomStatus.Stopped) {
        return (
            <div className="room-detail-footer-btn-container">
                <Button
                    className="room-detail-footer-btn"
                    onClick={onReplayRoom}
                    disabled={!room.hasRecord}
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
                className="room-detail-footer-btn"
                danger
                onClick={() => setCancelModalVisible(true)}
                disabled={!disabled}
            >
                {title}
            </Button>
            {isCreator && (
                <Button
                    className="room-detail-footer-btn"
                    onClick={onModifyRoom}
                    disabled={!disabled}
                >
                    {t("modify-room")}
                </Button>
            )}
            <Button className="room-detail-footer-btn" onClick={() => setIsShowInviteModal(true)}>
                {t("copy-invitation")}
            </Button>
            <Button className="room-detail-footer-btn" type="primary" onClick={onJoinRoom}>
                {room.roomStatus === RoomStatus.Idle ? t("begin") : t("join-room")}
            </Button>
            <InviteModal
                visible={isShowInviteModal}
                room={room}
                baseUrl={inviteBaseUrl}
                periodicWeeks={periodicWeeks}
                userName={userName}
                onCopy={text => {
                    onCopyInvitation(text);
                    void message.success(t("copy-success"));
                    hideInviteModal();
                }}
                onCancel={hideInviteModal}
            />
            <RemoveRoomModal
                cancelModalVisible={cancelModalVisible}
                onCancel={() => setCancelModalVisible(false)}
                isCreator={isCreator}
                roomUUID={room?.roomUUID}
                periodicUUID={room?.periodicUUID}
                isPeriodicDetailsPage={isPeriodicDetailsPage}
                onCancelRoom={onCancelRoom}
            />
        </div>
    );
});

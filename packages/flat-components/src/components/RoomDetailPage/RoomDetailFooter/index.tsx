import "./index.less";

import React, { useState } from "react";
import { Button, message } from "antd";
import { observer } from "mobx-react-lite";
import { RoomInfo, RoomStatus, Week } from "../../../types/room";
import { InviteModal } from "../../InviteModal";
import { RemoveRoomModal } from "../../RemoveRoomModal";

export interface RoomDetailFooterProps {
    room: RoomInfo;
    userName: string;
    isCreator: boolean;
    isPeriodicDetailsPage: boolean;
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
    isCreator,
    isPeriodicDetailsPage,
    periodicWeeks,
    onJoinRoom,
    onReplayRoom,
    onModifyRoom,
    onCancelRoom,
    onCopyInvitation,
}) {
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
                    查看回放
                </Button>
            </div>
        );
    }

    const disabled = !isCreator || room.roomStatus === RoomStatus.Idle;
    const title = isCreator ? "取消房间" : "移除房间";

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
                    修改房间
                </Button>
            )}
            <Button className="room-detail-footer-btn" onClick={() => setIsShowInviteModal(true)}>
                复制邀请
            </Button>
            <Button className="room-detail-footer-btn" type="primary" onClick={onJoinRoom}>
                进入房间
            </Button>
            <InviteModal
                visible={isShowInviteModal}
                room={room}
                periodicWeeks={periodicWeeks}
                userName={userName}
                onCopy={text => {
                    onCopyInvitation(text);
                    message.success("复制成功");
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

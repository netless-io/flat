import React, { useState } from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import { generateRoutePath, RouteNameType, usePushHistory } from "../../utils/routes";
import { RoomItem } from "../../stores/RoomStore";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import { InviteModal } from "../../components/Modal/InviteModal";
import { RemoveRoomModal } from "../../components/Modal/RemoveRoomModal";
import { observer } from "mobx-react-lite";

export interface RoomDetailFooterProps {
    room: RoomItem;
    isCreator: boolean;
    onJoinRoom: () => void;
}

export const RoomDetailFooter = observer<RoomDetailFooterProps>(function RoomDetailFooter({
    room,
    isCreator,
    onJoinRoom,
}) {
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [isShowInviteModal, setIsShowInviteModal] = useState(false);
    const pushHistory = usePushHistory();

    if (room.roomStatus === RoomStatus.Stopped) {
        const replayRoom = (): void => {
            pushHistory(RouteNameType.ReplayPage, {
                roomUUID: room.roomUUID,
                ownerUUID: room.ownerUUID,
                roomType: room.roomType!,
            });
        };

        return (
            <div className="user-room-btn-box">
                <Button className="user-room-btn" onClick={replayRoom} disabled={!room.hasRecord}>
                    查看回放
                </Button>
            </div>
        );
    }

    const isIdleStatus = room.roomStatus === RoomStatus.Idle;
    const title = isCreator ? "取消房间" : "移除房间";

    return (
        <div className="user-room-btn-box">
            <Button
                className="user-room-btn"
                danger
                onClick={() => setCancelModalVisible(true)}
                disabled={!isIdleStatus}
            >
                {title}
            </Button>
            {isCreator && (
                <Button className="user-room-btn" disabled={!isIdleStatus}>
                    <Link
                        to={{
                            pathname: generateRoutePath(RouteNameType.ModifyOrdinaryRoomPage, {
                                roomUUID: room.roomUUID,
                                periodicUUID: room.periodicUUID,
                            }),
                        }}
                    >
                        修改房间
                    </Link>
                </Button>
            )}
            <Button className="user-room-btn" onClick={() => setIsShowInviteModal(true)}>
                复制邀请
            </Button>
            <Button className="user-room-btn" type="primary" onClick={onJoinRoom}>
                进入房间
            </Button>
            <InviteModal
                visible={isShowInviteModal}
                room={room}
                onCancel={() => setIsShowInviteModal(false)}
            />
            <RemoveRoomModal
                cancelModalVisible={cancelModalVisible}
                onCancel={() => setCancelModalVisible(false)}
                isCreator={isCreator}
                roomUUID={room?.roomUUID}
                periodicUUID={room?.periodicUUID}
            />
        </div>
    );
});

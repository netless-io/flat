import React, { FC } from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import { generateRoutePath, RouteNameType, usePushHistory } from "../../utils/routes";
import { RoomItem } from "../../stores/RoomStore";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";

export interface RoomDetailFooterProps {
    room: RoomItem;
    isCreator: boolean;
    onJoinRoom: () => void;
    onCancelRoom: () => void;
    onInvite: () => void;
}

export const RoomDetailFooter: FC<RoomDetailFooterProps> = ({
    room,
    isCreator,
    onJoinRoom,
    onCancelRoom,
    onInvite,
}) => {
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

    return isCreator ? (
        <div className="user-room-btn-box">
            <Button
                className="user-room-btn"
                danger
                onClick={onCancelRoom}
                disabled={!isIdleStatus}
            >
                取消房间
            </Button>
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
            <Button className="user-room-btn" onClick={onInvite}>
                复制邀请
            </Button>
            <Button className="user-room-btn" type="primary" onClick={onJoinRoom}>
                进入房间
            </Button>
        </div>
    ) : (
        <div className="user-room-btn-box">
            <Button
                className="user-room-btn"
                danger
                onClick={onCancelRoom}
                disabled={!isIdleStatus}
            >
                移除房间
            </Button>
            <Button className="user-room-btn" onClick={onInvite} disabled={!isIdleStatus}>
                复制邀请
            </Button>
            <Button type="primary" className="user-room-btn" onClick={onJoinRoom}>
                进入房间
            </Button>
        </div>
    );
};

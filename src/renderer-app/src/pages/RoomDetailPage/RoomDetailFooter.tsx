import React, { FC } from "react";
import { Button } from "antd";

export interface RoomDetailFooterProps {
    isCreator: boolean;
    isIdleStatus: boolean;
    onJoinRoom: () => void;
    onCancelRoom: () => void;
    onInvite: () => void;
}

export const RoomDetailFooter: FC<RoomDetailFooterProps> = ({
    isCreator,
    isIdleStatus,
    onJoinRoom,
    onCancelRoom,
    onInvite,
}) =>
    isCreator ? (
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
                修改房间
            </Button>
            <Button className="user-room-btn" onClick={onInvite}>
                邀请加入
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
                删除房间
            </Button>
            <Button className="user-room-btn" onClick={onInvite} disabled={!isIdleStatus}>
                邀请加入
            </Button>
            <Button type="primary" className="user-room-btn" onClick={onJoinRoom}>
                进入房间
            </Button>
        </div>
    );

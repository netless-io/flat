import React, { FC } from "react";
import { Button } from "antd";

export interface RoomDetailFooterProps {
    isCreator: boolean;
    onJoinRoom: () => void;
    onCancelRoom: () => void;
    onInvite: () => void;
}

export const RoomDetailFooter: FC<RoomDetailFooterProps> = ({
    isCreator,
    onJoinRoom,
    onCancelRoom,
    onInvite,
}) =>
    isCreator ? (
        <div className="user-room-btn-box">
            <Button className="user-room-btn" danger onClick={onCancelRoom}>
                取消房间
            </Button>
            <Button className="user-room-btn">修改房间</Button>
            <Button className="user-room-btn" onClick={onInvite}>
                邀请加入
            </Button>
            <Button className="user-room-btn" type="primary" onClick={onJoinRoom}>
                进入房间
            </Button>
        </div>
    ) : (
        <div className="user-room-btn-box">
            <Button className="user-room-btn" danger onClick={onCancelRoom}>
                删除房间
            </Button>
            <Button className="user-room-btn" onClick={onInvite}>
                邀请加入
            </Button>
            <Button type="primary" className="user-room-btn" onClick={onJoinRoom}>
                进入房间
            </Button>
        </div>
    );

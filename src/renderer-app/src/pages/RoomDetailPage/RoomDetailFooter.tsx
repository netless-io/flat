import React, { FC } from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import { generateRoutePath, RouteNameType } from "../../utils/routes";

export interface RoomDetailFooterProps {
    isCreator: boolean;
    isIdleStatus: boolean;
    onJoinRoom: () => void;
    onCancelRoom: () => void;
    onInvite: () => void;
    periodicUUID?: string;
    roomUUID: string;
}

export const RoomDetailFooter: FC<RoomDetailFooterProps> = ({
    isCreator,
    isIdleStatus,
    onJoinRoom,
    onCancelRoom,
    onInvite,
    periodicUUID,
    roomUUID,
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
                <Link
                    to={{
                        pathname: generateRoutePath(RouteNameType.ModifyOrdinaryRoomPage, {
                            roomUUID,
                            periodicUUID: periodicUUID || void 0,
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

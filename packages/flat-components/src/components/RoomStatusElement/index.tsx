import "./index.less";

import React from "react";
import { RoomInfo, RoomStatus } from "../../types/room";

export interface RoomStatusElementProps {
    room: RoomInfo;
}

export const RoomStatusElement: React.FC<RoomStatusElementProps> = ({ room }) => {
    switch (room.roomStatus) {
        case RoomStatus.Started:
        case RoomStatus.Paused: {
            return <span className="room-status-started">进行中</span>;
        }
        case RoomStatus.Stopped: {
            return <span className="room-status-stopped">已结束</span>;
        }
        default: {
            return <span className="room-status-idle">待开始</span>;
        }
    }
};

import React from "react";
import { observer } from "mobx-react-lite";
import { RoomStatus } from "../../api-middleware/flatServer/constants";
import "./RoomStatusElement.less";
import { RoomItem } from "../../stores/room-store";

export interface RoomStatusElementProps {
    room: RoomItem;
}

export const RoomStatusElement = observer<RoomStatusElementProps>(function RoomStatusElement({
    room,
}) {
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
});

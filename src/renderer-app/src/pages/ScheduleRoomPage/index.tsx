import React from "react";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import { RouteComponentProps } from "react-router";

type ScheduleRoomPageState = {
    periodic: {
        ownerUUID: string;  // 创建者的 uuid
        endTime?: Date; // 有可能为空
        rate: number, // 默认为 0（即 用户选择的是 endTime）
    },
    rooms: {
        roomUUID: string;
        beginTime: Date;
        endTime: Date;
        roomStatus: RoomStatus;
    }
}

export default class ScheduleRoomPage extends React.Component<RouteComponentProps, ScheduleRoomPageState> {
    public constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            periodic: {
                ownerUUID: "",
                endTime: new Date(),
                rate: 0,
            },
            rooms: {
                roomUUID: "",
                beginTime: new Date(),
                endTime: new Date(),
                roomStatus: RoomStatus.Pending,
            },
        }
    }

    public render() {
        return (
            <div className="schedule-room-info-container">
                ScheduleRoomPage
            </div>
        )
    }
}

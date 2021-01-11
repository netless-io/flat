import React, { PureComponent } from "react";
import "./MainRoomList.less";
import { MainRoomListItem } from "./MainRoomListItem";
import emptyBoxSVG from "../assets/image/empty-box.svg";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";
import { FlatServerRoom, ListRoomsType } from "../apiMiddleware/flatServer";
import { isSameDay } from "date-fns/fp";

export type MainRoomListProps = {
    rooms: FlatServerRoom[];
    type: ListRoomsType;
    onTypeChange: (type: ListRoomsType) => void;
    historyPush: (path: string) => void;
};

export class MainRoomList extends PureComponent<MainRoomListProps> {
    private getRoomUUID = (room: FlatServerRoom) => {
        return room.roomUUID;
    };

    private getPeriodicUUID = (room: FlatServerRoom) => {
        return room.periodicUUID;
    };

    private renderStatus = (status: RoomStatus) => {
        return status;
    };

    private timeToNumber = (time: string): number | undefined => {
        return time ? Number(new Date(time)) : undefined;
    };

    public renderRooms() {
        const { rooms } = this.props;
        if (rooms.length === 0) {
            return (
                <div className="room-empty-box">
                    <img src={emptyBoxSVG} alt={"emptyBoxSVG"} />
                    <span>暂无预约课程</span>
                </div>
            );
        }
        let lastOne: FlatServerRoom | null = null;
        return rooms.map(room => {
            const showDate =
                !lastOne || !isSameDay(new Date(room.beginTime), new Date(lastOne.beginTime));
            lastOne = room;
            return (
                <MainRoomListItem
                    key={this.getRoomUUID(room)}
                    showDate={showDate}
                    title={room.title}
                    status={this.renderStatus(room.roomStatus)}
                    beginTime={this.timeToNumber(room.beginTime)!}
                    endTime={this.timeToNumber(room.endTime)}
                    periodicUUID={this.getPeriodicUUID(room)}
                    roomUUID={this.getRoomUUID(room)}
                    historyPush={this.props.historyPush}
                    userUUID={room.ownerUUID}
                />
            );
        });
    }

    public getColor = (theType: ListRoomsType): string => {
        return this.props.type === theType ? "#3381FF" : "#7A7B7C";
    };

    public getTypeText = (sort: ListRoomsType): string => {
        const roomListTypeTextMap: Record<ListRoomsType, string> = {
            [ListRoomsType.All]: "全部",
            [ListRoomsType.Today]: "今天",
            [ListRoomsType.Periodic]: "周期",
            [ListRoomsType.History]: "历史",
        };
        return roomListTypeTextMap[sort];
    };

    public renderSorts() {
        return [ListRoomsType.All, ListRoomsType.Today, ListRoomsType.Periodic].map(e => {
            return (
                <span
                    key={e}
                    style={{ color: this.getColor(e) }}
                    onClick={() => this.props.onTypeChange(e)}
                    className="room-list-tab"
                >
                    {this.getTypeText(e)}
                </span>
            );
        });
    }

    public render() {
        return (
            <div className="room-list-container">
                <div className="room-list-header">
                    <div>
                        <span className="room-list-title">房间列表</span>
                    </div>
                    <div>{this.renderSorts()}</div>
                </div>
                <div className="room-list-line" />
                <div className="room-list-body">{this.renderRooms()}</div>
            </div>
        );
    }
}

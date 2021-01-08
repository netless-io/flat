import React, { PureComponent } from "react";
import "./MainRoomList.less";
import { MainRoomListItem } from "./MainRoomListItem";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";
import { FlatServerRoom, ListRoomsType } from "../apiMiddleware/flatServer";
import { isSameDay } from "date-fns/esm";

export type MainRoomListProps = {
    rooms: FlatServerRoom[];
    type: ListRoomsType;
    onTypeChange: (type: ListRoomsType) => void;
    historyPush: (path: string) => void;
};

export class MainRoomList extends PureComponent<MainRoomListProps> {
    private getRoomUUID = (e: FlatServerRoom) => {
        return e.roomUUID;
    };

    private getPeriodicUUID = (e: FlatServerRoom) => {
        return e.periodicUUID;
    }

    private renderStatus = (status: RoomStatus) => {
        return status;
    };

    private timeToNumber(time: string): number | undefined {
        return time ? Number(new Date(time)) : undefined;
    }

    public renderRooms() {
        let lastOne: FlatServerRoom | null = null;
        return this.props.rooms.map(e => {
            const showDate = !lastOne || !isSameDay(new Date(e.beginTime), new Date(lastOne.beginTime));
            lastOne = e;
            return (
                <MainRoomListItem
                    key={this.getRoomUUID(e)}
                    showDate={showDate}
                    title={e.title}
                    status={this.renderStatus(e.roomStatus)}
                    beginTime={this.timeToNumber(e.beginTime)!}
                    endTime={this.timeToNumber(e.endTime)}
                    periodicUUID={this.getPeriodicUUID(e)}
                    roomUUID={this.getRoomUUID(e)}
                    historyPush={this.props.historyPush}
                    userUUID={e.ownerUUID}
                />
            );
        });
    }

    public getColor = (theType: ListRoomsType): string => {
        return this.props.type === theType ? "#3381FF" : "#7A7B7C";
    };

    public getTypeText = (sort: ListRoomsType) => {
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
                <div className="room-list-body">
                    {this.renderRooms()}
                    <div className="room-list-under" />
                </div>
            </div>
        );
    }
}

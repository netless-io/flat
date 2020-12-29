import React, { PureComponent } from "react";
import "./MainRoomList.less";
import { RoomListType, Room } from "../UserIndexPage";
import { MainRoomListItem } from "./MainRoomListItem";

export class MainRoomList extends PureComponent<MainRoomListProps> {
    private getRoomUUID = (e: Room) => {
        if (e.periodicUUID) {
            return e.periodicUUID;
        } else {
            return e.roomUUID;
        }
    };

    private renderStatus = (status: RoomStatus) => {
        return status;
    };

    private timeToNumber(time: string): number | undefined {
        return time ? Number(new Date(time)) : undefined;
    }

    public renderRooms() {
        return this.props.rooms.map(e => {
            return (
                <MainRoomListItem
                    key={this.getRoomUUID(e)}
                    title={e.title}
                    status={this.renderStatus(e.roomStatus)}
                    beginTime={this.timeToNumber(e.beginTime)!}
                    endTime={this.timeToNumber(e.endTime)}
                    isCyclical={Boolean(e.periodicUUID)}
                    historyPush={this.props.historyPush}
                    uuid={this.getRoomUUID(e)}
                    userUUID={e.ownerUUID}
                />
            );
        });
    }

    public getColor = (theType: RoomListType): string => {
        return this.props.type === theType ? "#3381FF" : "#7A7B7C";
    };

    public getTypeText = (sort: RoomListType) => {
        const roomListTypeTextMap: Record<RoomListType, string> = {
            [RoomListType.All]: "全部",
            [RoomListType.Today]: "今天",
            [RoomListType.Periodic]: "周期",
            [RoomListType.History]: "历史",
        };
        return roomListTypeTextMap[sort];
    };

    public renderSorts() {
        return [RoomListType.All, RoomListType.Today, RoomListType.Periodic].map(e => {
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

export type MainRoomListProps = {
    rooms: Room[];
    type: RoomListType;
    onTypeChange: (type: RoomListType) => void;
    historyPush: (path: string) => void;
}

export enum RoomStatus {
    Pending = "Pending",
    Running = "Running",
    Stopped = "Stopped",
}

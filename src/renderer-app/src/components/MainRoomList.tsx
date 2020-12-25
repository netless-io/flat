import React, { PureComponent } from "react";
import { Room, RoomListType } from "../UserIndexPage";
import "./MainRoomList.less";
import { MainRoomListItem } from "./MainRoomListItem";

export type MainRoomListProps = {
    rooms: Room[];
    type: RoomListType;
    onTypeChange: (type: RoomListType) => void;
    historyPush: (path: string) => void;
};

export class MainRoomList extends PureComponent<MainRoomListProps> {
    private getRoomUUID = (e: Room) => {
        if (e.cyclicalUUID) {
            return e.cyclicalUUID;
        } else {
            return e.roomUUID;
        }
    };

    private renderStatus = (status: "Pending" | "Running" | "Stopped") => {
        return status;
    };

    private timeToNumber(time: string): number | undefined {
        return time ? Number(new Date(time)) : undefined;
    }

    private renderRooms = () => {
        return this.props.rooms.map(e => {
            return (
                <MainRoomListItem
                    key={this.getRoomUUID(e)}
                    title={e.title}
                    status={this.renderStatus(e.roomStatus)}
                    beginTime={this.timeToNumber(e.beginTime)!}
                    endTime={this.timeToNumber(e.endTime)}
                    isCyclical={Boolean(e.cyclicalUUID)}
                    uuid={this.getRoomUUID(e)}
                    userUUID={e.creatorUserUUID}
                    historyPush={this.props.historyPush}
                />
            );
        });
    };

    private getTypeText = (sort: RoomListType) => {
        const roomListTypeTextMap: Record<RoomListType, string> = {
            [RoomListType.all]: "全部",
            [RoomListType.today]: "今天",
            [RoomListType.cyclical]: "周期",
            [RoomListType.history]: "历史",
        };
        return roomListTypeTextMap[sort];
    };

    private getColor = (theType: RoomListType): string => {
        const type = this.props.type;
        return type === theType ? "#3381FF" : "#7A7B7C";
    };

    private renderSorts = () => {
        return [RoomListType.all, RoomListType.today, RoomListType.cyclical].map(e => {
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
    };

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

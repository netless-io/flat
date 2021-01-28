import { Button, Dropdown, Menu } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { cancelHistoryRoom, FlatServerRoom } from "../apiMiddleware/flatServer";
import { generateRoutePath, RouteNameType } from "../utils/routes";
import RoomListDate from "./RoomListPanel/RoomListDate";
import RoomListDuration from "./RoomListPanel/RoomListDuration";

export type MainRoomListItemProps = {
    room: FlatServerRoom;
    showDate: boolean;
    historyPush: (path: string) => void;
};

export default class MainRoomHistoryItem extends React.PureComponent<MainRoomListItemProps> {
    public renderMenu = (): JSX.Element => {
        const { roomUUID, periodicUUID } = this.props.room;
        return (
            <Menu>
                <Menu.Item>
                    <Link
                        to={{
                            pathname: generateRoutePath(RouteNameType.RoomDetailPage, {
                                roomUUID,
                                periodicUUID: periodicUUID || void 0,
                            }),
                        }}
                    >
                        房间详情
                    </Link>
                </Menu.Item>
                <Menu.Item onClick={this.delHistoryRoom}>删除记录</Menu.Item>
            </Menu>
        );
    };

    public delHistoryRoom = (): void => {
        const { roomUUID } = this.props.room;
        cancelHistoryRoom(roomUUID);
    };

    private gotoReplay = (): void => {
        const { roomUUID, ownerUUID, roomType } = this.props.room;
        const url = `/replay/${roomType}/${roomUUID}/${ownerUUID}/`;
        this.props.historyPush(url);
    };

    render(): JSX.Element {
        const { beginTime, endTime, title, hasRecord } = this.props.room;

        return (
            <div className="room-list-cell-item">
                {this.props.showDate && (
                    <div className="room-list-cell-day">
                        <div className="room-list-cell-modify" />
                        <div className="room-list-cell-title">
                            <RoomListDate beginTime={beginTime} />
                        </div>
                    </div>
                )}
                <div className="room-list-cell">
                    <div className="room-list-cell-left">
                        <div className="room-list-cell-name">{title}</div>
                        <div className="room-list-cell-state">
                            <span className="room-stopped">已结束</span>
                        </div>
                        <div className="room-list-cell-time">
                            <RoomListDuration beginTime={beginTime} endTime={endTime} />
                        </div>
                    </div>
                    <div className="room-list-cell-right">
                        <Dropdown overlay={this.renderMenu()}>
                            <Button className="room-list-cell-more">更多</Button>
                        </Dropdown>
                        {hasRecord ? (
                            <Button
                                className="room-list-cell-enter"
                                type="primary"
                                onClick={this.gotoReplay}
                            >
                                查看回放
                            </Button>
                        ) : (
                            <Button disabled className="room-list-cell-enter" type="primary">
                                查看回放
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

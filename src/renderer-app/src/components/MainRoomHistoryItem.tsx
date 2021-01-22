import { Button, Dropdown, Menu } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { cancelHistoryRoom } from "../apiMiddleware/flatServer";
import { getUserUuid } from "../utils/localStorage/accounts";
import { Identity } from "../utils/localStorage/room";
import RoomListDate from "./RoomListPanel/RoomListDate";
import RoomListDuration from "./RoomListPanel/RoomListDuration";

export type MainRoomListItemProps = {
    showDate: boolean;
    /** 标题 */
    title: string;
    /** 开始时间 (UTC 时间戳) */
    beginTime: number;
    /** 结束时间 (UTC 时间戳) */
    endTime: number;
    /** 周期 uuid */
    periodicUUID: string | null;
    /** 房间 uuid */
    roomUUID: string;
    /** 发起者 userUUID */
    userUUID: string;

    historyPush: (path: string) => void;
};

export default class MainRoomHistoryItem extends React.PureComponent<MainRoomListItemProps> {
    public renderMenu = (): JSX.Element => {
        const { roomUUID, periodicUUID, userUUID } = this.props;
        return (
            <Menu>
                <Menu.Item>
                    <Link
                        to={{
                            pathname: "/user/room/",
                            state: {
                                roomUUID,
                                periodicUUID,
                                userUUID,
                            },
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
        const { roomUUID } = this.props;
        cancelHistoryRoom(roomUUID);
    };

    public getIdentity = (): Identity => {
        return getUserUuid() === this.props.userUUID ? Identity.creator : Identity.joiner;
    };

    private gotoReplay = (): void => {
        const { roomUUID } = this.props;
        const identity = this.getIdentity();
        const url = `/replay/${identity}/${roomUUID}/${getUserUuid()}/`;
        this.props.historyPush(url);
    };

    render(): JSX.Element {
        const { beginTime, endTime, title } = this.props;
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
                        <Button
                            className="room-list-cell-enter"
                            type="primary"
                            onClick={this.gotoReplay}
                        >
                            查看回放
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

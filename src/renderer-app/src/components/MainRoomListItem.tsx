import { Button, Dropdown, Menu } from "antd";
import { format, isToday, isTomorrow } from "date-fns";
import { zhCN } from "date-fns/locale";
import React, { PureComponent } from "react";
import { cancelOrdinaryRoom, cancelPeriodicRoom } from "../apiMiddleware/flatServer";
import { Identity } from "../utils/localStorage/room";
import { Link } from "react-router-dom";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";
import { getUserUuid } from "../utils/localStorage/accounts";
import RoomListDate from "./RoomListPanel/RoomListDate";
import RoomListDuration from "./RoomListPanel/RoomListDuration";
import { roomStore } from "../stores/RoomStore";

export type MainRoomListItemProps = {
    showDate: boolean;
    /** 标题 */
    title: string;
    /** 开始时间 (UTC 时间戳) */
    beginTime: number;
    /** 结束时间 (UTC 时间戳) */
    endTime: number;
    /** 状态 */
    roomStatus: RoomStatus;
    /** 周期 uuid */
    periodicUUID: string | null;
    /** 房间 uuid */
    roomUUID: string;
    /** 发起者 userUUID */
    userUUID: string;

    historyPush: (path: string) => void;
};

/** 房间列表 - 单个房间 */
export class MainRoomListItem extends PureComponent<MainRoomListItemProps> {
    public renderMenu = (): JSX.Element => {
        const { roomUUID, periodicUUID, userUUID, title, beginTime, endTime } = this.props;
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
                <Menu.Item>
                    <Link
                        to={{
                            pathname: "/modify/",
                            state: {
                                roomUUID,
                                periodicUUID,
                                headerValue: "修改房间",
                                title,
                                beginTime,
                                endTime,
                            },
                        }}
                    >
                        修改房间
                    </Link>
                </Menu.Item>
                <Menu.Item onClick={this.cancelRoom}>取消房间</Menu.Item>
                <Menu.Item>复制邀请</Menu.Item>
            </Menu>
        );
    };

    public renderDate = (): JSX.Element => {
        const { beginTime } = this.props;
        return (
            <time dateTime={new Date(beginTime).toUTCString()}>
                {format(beginTime, "MMMM do", { locale: zhCN })}
                {isToday(beginTime) && " 今天"}
                {isTomorrow(beginTime) && " 明天"}
            </time>
        );
    };

    public cancelRoom = (): void => {
        const { periodicUUID, roomUUID } = this.props;
        if (periodicUUID) {
            cancelPeriodicRoom(periodicUUID);
        } else {
            cancelOrdinaryRoom(roomUUID);
        }
    };

    public renderState = (): JSX.Element | null => {
        if (this.props.roomStatus === RoomStatus.Idle) {
            return <span className="room-idle">未开始</span>;
        } else if (this.props.roomStatus === RoomStatus.Started) {
            return <span className="room-started">进行中</span>;
        } else if (this.props.roomStatus === RoomStatus.Paused) {
            return <span className="room-paused">已暂停</span>;
        } else if (this.props.roomStatus === RoomStatus.Stopped) {
            return <span className="room-stopped">已结束</span>;
        } else {
            return null;
        }
    };

    public getIdentity = (): Identity => {
        return getUserUuid() === this.props.userUUID ? Identity.creator : Identity.joiner;
    };

    public joinRoom = async (): Promise<void> => {
        const { roomUUID, periodicUUID } = this.props;
        const data = await roomStore.joinRoom(periodicUUID || roomUUID);
        const url = `/classroom/${data.roomType}/${roomUUID}/${data.ownerUUID}/`;
        this.props.historyPush(url);
    };

    render(): JSX.Element {
        const { beginTime, endTime, title, periodicUUID } = this.props;
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
                            {this.renderState()}
                            {periodicUUID ? <span>周期</span> : null}
                        </div>
                        <div className="room-list-cell-time">
                            <RoomListDuration beginTime={beginTime} endTime={endTime} />
                        </div>
                    </div>
                    <div className="room-list-cell-right">
                        <Dropdown overlay={this.renderMenu()} trigger={["click"]}>
                            <Button className="room-list-cell-more">更多</Button>
                        </Dropdown>
                        <Button
                            className="room-list-cell-enter"
                            type="primary"
                            onClick={this.joinRoom}
                        >
                            进入房间
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

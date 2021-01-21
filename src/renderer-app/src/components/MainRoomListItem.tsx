import { Button, Dropdown, Menu } from "antd";
import { format, isToday, isTomorrow } from "date-fns";
import { zhCN } from "date-fns/locale";
import React, { PureComponent } from "react";
import { cancelOrdinaryRoom, cancelPeriodicRoom, joinRoom } from "../apiMiddleware/flatServer";
import { globals } from "../utils/globals";
import { Identity } from "../utils/localStorage/room";
import { Link } from "react-router-dom";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";
import { getUserUuid } from "../utils/localStorage/accounts";
import RoomListDate from "./RoomListPanel/RoomListDate";
import RoomListDuration from "./RoomListPanel/RoomListDuration";
import { globalStore } from "../stores/GlobalStore";

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
    periodicUUID: string;
    /** 房间 uuid */
    roomUUID: string;
    /** 发起者 userUUID */
    userUUID: string;

    historyPush: (path: string) => void;
};

/** 房间列表 - 单个房间 */
export class MainRoomListItem extends PureComponent<MainRoomListItemProps> {
    public renderMenu = () => {
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
                <Menu.Item>修改房间</Menu.Item>
                <Menu.Item onClick={this.cancelRoom}>取消房间</Menu.Item>
                <Menu.Item>复制邀请</Menu.Item>
            </Menu>
        );
    };

    public renderDate = () => {
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

    public renderState = () => {
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

    public getIdentity = () => {
        return getUserUuid() === this.props.userUUID ? Identity.creator : Identity.joiner;
    };

    public joinRoom = async () => {
        const { roomUUID, periodicUUID } = this.props;
        const identity = this.getIdentity();
        const data = await joinRoom(periodicUUID || roomUUID);

        // @TODO remove globals
        globals.whiteboard.uuid = data.whiteboardRoomUUID;
        globals.whiteboard.token = data.whiteboardRoomToken;
        globals.rtc.uid = data.rtcUID;
        globals.rtc.token = data.rtcToken;
        globals.rtm.token = data.rtmToken;

        globalStore.updateToken({
            whiteboardUUID: data.whiteboardRoomUUID,
            whiteboardToken: data.whiteboardRoomToken,
            rtcToken: data.rtcToken,
            rtmToken: data.rtmToken,
        });

        const url = `/${data.roomType}/${identity}/${roomUUID}/${getUserUuid()}/`;
        this.props.historyPush(url);
    };

    render() {
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
                        <div className="room-list-cell-state">{this.renderState()}</div>
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

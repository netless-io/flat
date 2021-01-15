import { Button, Dropdown, Menu } from "antd";
import { format, isToday, isTomorrow } from "date-fns";
import { zhCN } from "date-fns/locale";
import React, { PureComponent } from "react";
import { cancelOrdinaryRoom, cancelPeriodicRoom, joinRoom } from "../apiMiddleware/flatServer";
import { globals } from "../utils/globals";
import { Identity } from "../utils/localStorage/room";
import { Link } from "react-router-dom";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";

export type MainRoomListItemProps = {
    showDate: boolean;
    /** 标题 */
    title: string;
    /** 开始时间 (UTC 时间戳) */
    beginTime: number;
    /** 结束时间 (UTC 时间戳) */
    endTime?: number;
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
    public renderMenu = () => (
        <Menu>
            <Menu.Item>
                <Link
                    to={{
                        pathname: "/user/room/",
                        state: {
                            roomUUID: this.props.roomUUID,
                            periodicUUID: this.props.periodicUUID,
                            userUUID: this.props.userUUID,
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

    public renderDate = () => (
        <time dateTime={new Date(this.props.beginTime).toUTCString()}>
            {format(this.props.beginTime, "MMMM do", { locale: zhCN })}
            {isToday(this.props.beginTime) && " 今天"}
            {isTomorrow(this.props.beginTime) && " 明天"}
        </time>
    );

    public cancelRoom = (): void => {
        const { periodicUUID, roomUUID } = this.props;
        if (periodicUUID !== "") {
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

    public renderDuration = () => {
        return (
            <>
                <span>{format(this.props.beginTime, "HH:mm")}</span>
                <span> ~ </span>
                {this.props.endTime && <span>{format(this.props.endTime, "HH:mm")}</span>}
            </>
        );
    };

    public getUserUUID = () => {
        return localStorage.getItem("userUUID") || "";
    };

    public getIdentity = () => {
        return this.getUserUUID() === this.props.userUUID ? Identity.creator : Identity.joiner;
    };

    public joinRoom = async () => {
        const { roomUUID } = this.props;
        const identity = this.getIdentity();
        const data = await joinRoom(roomUUID);
        globals.whiteboard.uuid = data.whiteboardRoomUUID;
        globals.whiteboard.token = data.whiteboardRoomToken;
        const url = `/${data.roomType}/${identity}/${roomUUID}/${this.getUserUUID()}/`;
        this.props.historyPush(url);
    };

    render() {
        return (
            <div className="room-list-cell-item">
                {this.props.showDate && (
                    <div className="room-list-cell-day">
                        <div className="room-list-cell-modify" />
                        <div className="room-list-cell-title">{this.renderDate()}</div>
                    </div>
                )}
                <div className="room-list-cell">
                    <div className="room-list-cell-left">
                        <div className="room-list-cell-name">{this.props.title}</div>
                        <div className="room-list-cell-state">{this.renderState()}</div>
                        <div className="room-list-cell-time">{this.renderDuration()}</div>
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

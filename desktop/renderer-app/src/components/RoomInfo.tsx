import React from "react";
import classNames from "classnames";
import { RoomStatus, RoomType } from "../apiMiddleware/flatServer/constants";

import "./RoomInfo.less";

export interface RoomInfoProps {
    roomStatus: RoomStatus;
    roomType?: RoomType;
}

export class RoomInfo extends React.PureComponent<RoomInfoProps> {
    public roomStatusLocale = {
        [RoomStatus.Idle]: "待开始",
        [RoomStatus.Started]: "进行中",
        [RoomStatus.Paused]: "已暂停",
        [RoomStatus.Stopped]: "已结束",
    };

    public roomInfoLocale = {
        [RoomType.BigClass]: "大班课",
        [RoomType.SmallClass]: "小班课",
        [RoomType.OneToOne]: "一对一",
    };

    public render(): React.ReactNode {
        const { roomStatus, roomType } = this.props;

        return (
            <div className="class-status">
                <span>
                    当前状态：
                    <span
                        className={classNames("class-status-progress", {
                            "is-active": roomStatus !== RoomStatus.Idle,
                        })}
                    >
                        {this.roomStatusLocale[roomStatus]}
                    </span>
                </span>
                <span>
                    当前模式：
                    <span className="class-status-mode">
                        {this.roomInfoLocale[roomType || RoomType.BigClass]}
                    </span>
                </span>
            </div>
        );
    }
}

export default RoomInfo;

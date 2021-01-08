import React from "react";
import classNames from "classnames";
import "./ClassStatus.less";
import { OrdinaryRoomInfo } from "../apiMiddleware/flatServer";
import { RoomType } from "../apiMiddleware/flatServer/constants";
import { ClassStatusType } from "../apiMiddleware/Rtm";

export interface ClassStatusProps {
    classStatus: ClassStatusType;
    roomInfo?: OrdinaryRoomInfo;
}

export class ClassStatus extends React.PureComponent<ClassStatusProps> {
    classStatusLocale = {
        [ClassStatusType.Idle]: "未开始",
        [ClassStatusType.Started]: "进行中",
        [ClassStatusType.Paused]: "已暂停",
        [ClassStatusType.Stopped]: "已停止",
    };

    roomInfoLocale = {
        [RoomType.BigClass]: "大班课",
        [RoomType.SmallClass]: "小班课",
        [RoomType.OneToOne]: "一对一",
    };

    render(): React.ReactNode {
        const { classStatus, roomInfo } = this.props;

        return (
            <div className="class-status">
                <span>
                    当前状态：
                    <span
                        className={classNames("class-status-progress", {
                            "is-active": classStatus !== ClassStatusType.Idle,
                        })}
                    >
                        {this.classStatusLocale[classStatus]}
                    </span>
                </span>
                <span>
                    当前模式：
                    <span className="class-status-mode">
                        {this.roomInfoLocale[roomInfo?.roomType || RoomType.BigClass]}
                    </span>
                </span>
            </div>
        );
    }
}

export default ClassStatus;

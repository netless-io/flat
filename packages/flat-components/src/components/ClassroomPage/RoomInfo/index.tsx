import "./style.less"

import classNames from "classnames";
import React, { FC } from "react";
import { RoomStatus, RoomType } from "../../../types/room";
import { getRoomStatusName, getRoomTypeName } from "../../../utils/room";

export interface RoomInfoProps {
    roomStatus: RoomStatus;
    roomType?: RoomType;
}

export const RoomInfo: FC<RoomInfoProps> = ({ roomStatus, roomType }) => (
    <div className="room-info">
        <span>
            当前状态：
            <span
                className={classNames("room-info-progress", {
                    "is-active": roomStatus !== RoomStatus.Idle,
                })}
            >
                {getRoomStatusName(roomStatus)}
            </span>
        </span>
        <span>
            当前模式：
            <span className="room-info-mode">
                {getRoomTypeName(roomType || RoomType.BigClass)}
            </span>
        </span>
    </div>
);

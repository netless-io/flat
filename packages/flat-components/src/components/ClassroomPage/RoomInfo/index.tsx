import "./style.less";

import classNames from "classnames";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { RoomStatus, RoomType } from "../../../types/room";
import { getRoomStatusName, getRoomTypeName } from "../../../utils/room";

export interface RoomInfoProps {
    roomStatus: RoomStatus;
    roomType?: RoomType;
}

export const RoomInfo: FC<RoomInfoProps> = ({ roomStatus, roomType }) => {
    const { t } = useTranslation();
    return (
        <div className="room-info">
            <span>
                {t("current-status")}
                <span
                    className={classNames("room-info-progress", {
                        "is-active": roomStatus !== RoomStatus.Idle,
                    })}
                >
                    {getRoomStatusName(roomStatus)}
                </span>
            </span>
            <span>
                {t("current-mode")}
                <span className="room-info-mode">
                    {getRoomTypeName(roomType || RoomType.BigClass)}
                </span>
            </span>
        </div>
    );
};

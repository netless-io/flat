import homeIconGraySVG from "./icons/home-icon-gray.svg";
import roomTypeSVG from "./icons/room-type.svg";
import "./index.less";

import React, { useMemo } from "react";
import { formatTime, roomTypeLocale } from "../../../utils/room";
import { formatDistanceStrict } from "date-fns";
import { zhCN } from "date-fns/locale";
import { RoomInfo } from "../../../types/room";
import { RoomStatusElement } from "../../RoomStatusElement";
import { useTranslation } from "react-i18next";

export interface RoomDetailBodyProps {
    roomInfo: RoomInfo;
}

export const RoomDetailBody: React.FC<RoomDetailBodyProps> = ({ roomInfo }) => {
    const { t } = useTranslation();
    const { beginTime, endTime } = roomInfo;

    const formattedBeginTime = useMemo(() => formatTime(beginTime), [beginTime]);
    const formattedEndTime = useMemo(() => formatTime(endTime), [endTime]);

    return (
        <div className="room-detail-body">
            <div className="room-detail-body-content">
                <div className="room-detail-body-content-time-container">
                    {formattedBeginTime && (
                        <div className="room-detail-body-content-time">
                            <div className="room-detail-body-content-time-number">
                                {formattedBeginTime.time}
                            </div>
                            <div className="room-detail-body-content-time-date">
                                {formattedBeginTime.date}
                            </div>
                        </div>
                    )}
                    {roomInfo.endTime && roomInfo.beginTime && (
                        <div className="room-detail-body-content-time-mid">
                            <div className="room-detail-body-content-time-mid-during">
                                {formatDistanceStrict(roomInfo.endTime, roomInfo.beginTime, {
                                    locale: zhCN,
                                })}
                            </div>
                            <div className="room-detail-body-content-time-mid-state">
                                <RoomStatusElement room={roomInfo} />
                            </div>
                        </div>
                    )}
                    {formattedEndTime && (
                        <div className="room-detail-body-content-time">
                            <div className="room-detail-body-content-time-number">
                                {formattedEndTime.time}
                            </div>
                            <div className="room-detail-body-content-time-date">
                                {formattedEndTime.date}
                            </div>
                        </div>
                    )}
                </div>
                <div className="room-detail-body-content-cut-line" />
                <div className="room-detail-body-content-info">
                    <div>
                        <img src={homeIconGraySVG} />
                        <span>{t("room-uuid")}</span>
                    </div>
                    <div className="room-detail-body-content-info-right">
                        {roomInfo.periodicUUID || roomInfo.roomUUID}
                    </div>
                </div>
                <div className="room-detail-body-content-info">
                    <div>
                        <img src={roomTypeSVG} />
                        <span>{t("room-type")}</span>
                    </div>
                    <div className="room-detail-body-content-info-right">
                        {roomTypeLocale(roomInfo.roomType)}
                    </div>
                </div>
            </div>
        </div>
    );
};

import homeIconGraySVG from "./icons/home-icon-gray.svg";
import roomTypeSVG from "./icons/room-type.svg";
import "./index.less";

import React, { useMemo } from "react";
import { formatInviteCode, formatTime } from "../../../utils/room";
import { formatDistanceStrict } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { RoomInfo, RoomType } from "../../../types/room";
import { RoomStatusElement } from "../../RoomStatusElement";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";

export interface RoomDetailBodyProps {
    roomInfo: RoomInfo;
    showRoomCountVisible?: boolean;
    jumpToPeriodicRoomDetailPage?: () => void;
}

export const RoomDetailBody = observer<RoomDetailBodyProps>(function RoomDetailBody({
    roomInfo,
    showRoomCountVisible,
    jumpToPeriodicRoomDetailPage,
}) {
    const { t, i18n } = useTranslation();
    const { beginTime, endTime, inviteCode, periodicUUID, roomUUID } = roomInfo;
    const uuid = periodicUUID || roomUUID;
    const lang = i18n.language;

    const formattedBeginTime = useMemo(
        () => (beginTime ? formatTime(beginTime, i18n.language) : null),
        [beginTime, i18n.language],
    );
    const formattedEndTime = useMemo(
        () => (endTime ? formatTime(endTime, i18n.language) : null),
        [endTime, i18n.language],
    );

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
                                    locale: lang?.startsWith("zh") ? zhCN : enUS,
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
                {showRoomCountVisible && (
                    <div
                        className="room-detail-body-content-room-count"
                        onClick={jumpToPeriodicRoomDetailPage}
                    >
                        {t("view-all-rooms-in-periodic-rooms", { count: roomInfo.count })}
                    </div>
                )}
                <div className="room-detail-body-content-cut-line" />
                <div className="room-detail-body-content-info">
                    <div>
                        <img src={homeIconGraySVG} />
                        <span>{t("room-uuid")}</span>
                    </div>
                    <div className="room-detail-body-content-info-right">
                        {formatInviteCode(uuid, inviteCode)}
                    </div>
                </div>
                <div className="room-detail-body-content-info">
                    <div>
                        <img src={roomTypeSVG} />
                        <span>{t("room-type")}</span>
                    </div>
                    <div className="room-detail-body-content-info-right">
                        {t(`class-room-type.${roomInfo.roomType || RoomType.BigClass}`)}
                    </div>
                </div>
            </div>
        </div>
    );
});

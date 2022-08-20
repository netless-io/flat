import { SVGRight } from "../../FlatIcons";
import "./style.less";

import React, { useMemo } from "react";
import { formatTime } from "../../../utils/room";
import { formatDistanceStrict } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { RoomInfo } from "../../../types/room";
import { useLanguage, useTranslate } from "@netless/flat-i18n";
import { observer } from "mobx-react-lite";

export interface RoomDetailBodyProps {
    roomInfo: RoomInfo;
    showRoomCountVisible?: boolean;
    title?: React.ReactNode;
    onBackPreviousPage?: () => void;
    jumpToPeriodicRoomDetailPage?: () => void;
}

export const RoomDetailHeader = /* @__PURE__ */ observer<RoomDetailBodyProps>(
    function RoomDetailBody({ roomInfo, showRoomCountVisible, jumpToPeriodicRoomDetailPage }) {
        const t = useTranslate();
        const language = useLanguage();
        const { beginTime, endTime } = roomInfo;
        const lang = language;

        const formattedBeginTime = useMemo(
            () => (beginTime ? formatTime(beginTime, language) : null),
            [beginTime, language],
        );
        const formattedEndTime = useMemo(
            () => (endTime ? formatTime(endTime, language) : null),
            [endTime, language],
        );

        return (
            <div className="room-detail-header-body">
                <div className="room-detail-header-container">
                    <div className="room-detail-header-content-left">
                        <div className="room-detail-header-content-title">
                            <span>{roomInfo.title}</span>
                        </div>
                        <div className="room-detail-header-content-title-cut-line" />
                        <span className="room-detail-header-content-time">
                            {" "}
                            {formattedBeginTime?.time} - {""}
                            {formattedEndTime?.time}
                        </span>
                        {roomInfo.endTime && roomInfo.beginTime && (
                            <span className="room-detail-header-content-time-during">
                                {"(" +
                                    formatDistanceStrict(roomInfo.endTime, roomInfo.beginTime, {
                                        locale: lang?.startsWith("zh") ? zhCN : enUS,
                                    }) +
                                    ")"}
                            </span>
                        )}
                    </div>
                    <div className="room-detail-header-content-right">
                        {showRoomCountVisible && (
                            <span
                                className="room-detail-header-content-room-count"
                                onClick={jumpToPeriodicRoomDetailPage}
                            >
                                {t("view-all-rooms-in-periodic-rooms", { count: roomInfo.count })}
                                <SVGRight />
                            </span>
                        )}
                    </div>
                </div>
                <div className="room-detail-header-content-bottom-cut-line" />
            </div>
        );
    },
);

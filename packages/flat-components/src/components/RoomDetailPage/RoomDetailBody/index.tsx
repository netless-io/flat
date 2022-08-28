import { SVGCircleInfoOutlined, SVGModeLecture, SVGTime, SVGUserGroup } from "../../FlatIcons";
import "./style.less";

import React, { useMemo } from "react";
import { formatInviteCode, formatTime } from "../../../utils/room";
import { RoomInfo, RoomType } from "../../../types/room";
import { RoomStatusElement } from "../../RoomStatusElement";
import { observer } from "mobx-react-lite";
import { useTranslate, useLanguage } from "@netless/flat-i18n";

export interface RoomDetailBodyProps {
    roomInfo: RoomInfo;
    showRoomCountVisible?: boolean;
    jumpToPeriodicRoomDetailPage?: () => void;
}

export const RoomDetailBody = /* @__PURE__ */ observer<RoomDetailBodyProps>(
    function RoomDetailBody({ roomInfo }) {
        const t = useTranslate();
        const language = useLanguage();
        const { beginTime, endTime, inviteCode, periodicUUID, roomUUID } = roomInfo;
        const uuid = periodicUUID || roomUUID;

        const formattedBeginTime = useMemo(
            () => (beginTime ? formatTime(beginTime, language) : null),
            [beginTime, language],
        );
        const formattedEndTime = useMemo(
            () => (endTime ? formatTime(endTime, language) : null),
            [endTime, language],
        );

        return (
            <div className="room-detail-body">
                <div className="room-detail-body-content">
                    <table>
                        <tbody>
                            <tr>
                                <td className="room-detail-body-content-left">
                                    <SVGCircleInfoOutlined />
                                    <span>{t("status")}</span>
                                </td>
                                <td className="room-detail-body-content-right">
                                    <RoomStatusElement room={roomInfo} />
                                </td>
                            </tr>
                            <tr>
                                <td className="room-detail-body-content-left">
                                    <SVGTime />
                                    <span>{t("time")}</span>
                                </td>
                                <td className="room-detail-body-content-right">
                                    <span>
                                        {formattedBeginTime?.date} {formattedBeginTime?.time} ~ {""}
                                        {formattedEndTime?.date} {formattedEndTime?.time}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="room-detail-body-content-left">
                                    <SVGModeLecture />
                                    <span>{t("room-uuid")}</span>
                                </td>
                                <td className="room-detail-body-content-right room-detail-body-selectable">
                                    {formatInviteCode(uuid, inviteCode)}
                                </td>
                            </tr>
                            <tr>
                                <td className="room-detail-body-content-left">
                                    <SVGUserGroup />
                                    <span>{t("room-type")}</span>
                                </td>
                                <td className="room-detail-body-content-right">
                                    {t(`class-room-type.${roomInfo.roomType || RoomType.BigClass}`)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    },
);

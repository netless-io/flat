import {
    SVGCircleInfoOutlined,
    SVGCopy,
    SVGModeLecture,
    SVGTime,
    SVGUserGroup,
} from "../../FlatIcons";
import "./style.less";

import React, { useCallback, useMemo } from "react";
import { Button, message } from "antd";
import { observer } from "mobx-react-lite";
import { useLanguage, useTranslate } from "@netless/flat-i18n";
import { RoomInfo, RoomType } from "../../../types/room";
import { formatInviteCode, formatTime } from "../../../utils/room";
import { RoomStatusElement } from "../../RoomStatusElement";

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

        const handleCopy = useCallback(
            (text: string) => {
                navigator.clipboard.writeText(text);
                void message.success(t("copy-success"));
            },
            [t],
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
                                        {formattedBeginTime?.date} {formattedBeginTime?.time}
                                        {" ~ "}
                                        {formattedEndTime?.date} {formattedEndTime?.time}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="room-detail-body-content-left">
                                    <SVGModeLecture />
                                    <span>{t("room-uuid")}</span>
                                </td>
                                <td className="room-detail-body-content-right">
                                    <span className="room-detail-body-selectable">
                                        {formatInviteCode(uuid, inviteCode)}
                                        {inviteCode && (
                                            <Button
                                                className="room-detail-body-content-btn"
                                                title={t("copy")}
                                                type="link"
                                                onClick={() =>
                                                    handleCopy(formatInviteCode(uuid, inviteCode))
                                                }
                                            >
                                                <SVGCopy />
                                            </Button>
                                        )}
                                    </span>
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

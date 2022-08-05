import "./index.less";

import React from "react";
import { RoomInfo, RoomStatus } from "../../types/room";
import { useTranslate } from "@netless/flat-i18n";

export interface RoomStatusElementProps {
    room: RoomInfo;
}

export const RoomStatusElement: React.FC<RoomStatusElementProps> = ({ room }) => {
    const t = useTranslate();
    switch (room.roomStatus) {
        case RoomStatus.Started:
        case RoomStatus.Paused: {
            return <span className="room-status-started">{t("room-status.running")}</span>;
        }
        case RoomStatus.Stopped: {
            return <span className="room-status-stopped">{t("room-status.stopped")}</span>;
        }
        default: {
            return <span className="room-status-idle">{t("room-status.upcoming")}</span>;
        }
    }
};

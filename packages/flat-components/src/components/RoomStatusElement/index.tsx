import React from "react";
import { useTranslation } from "react-i18next";
import { RoomInfo, RoomStatus } from "../../types/room";
import "./index.less";

export interface RoomStatusElementProps {
    room: RoomInfo;
}

export const RoomStatusElement: React.FC<RoomStatusElementProps> = ({ room }) => {
    const { t } = useTranslation();
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

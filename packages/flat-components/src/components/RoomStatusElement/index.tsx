import "./index.less";

import React from "react";
import { RoomInfo, RoomStatus } from "../../types/room";
import { useTranslate } from "@netless/flat-i18n";

export interface RoomStatusElementProps {
    room: RoomInfo;
}

const statusMap: Record<"running" | "stopped" | "upcoming", "started" | "stopped" | "idle"> = {
    running: "started",
    stopped: "stopped",
    upcoming: "idle",
};

export const RoomStatusElement: React.FC<RoomStatusElementProps> = ({ room }) => {
    const t = useTranslate();

    const now = Date.now();
    let status: "running" | "stopped" | "upcoming";
    if (room.beginTime && now < room.beginTime) {
        status = "upcoming";
    } else if (room.roomStatus === RoomStatus.Stopped || (room.endTime && now > room.endTime)) {
        status = "stopped";
    } else {
        status = "running";
    }

    return <span className={"room-status-" + statusMap[status]}>{t("room-status." + status)}</span>;
};

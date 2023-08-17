import "./style.less";
import emptyHistorySVG from "../icons/empty-history.svg";
import emptyRoomSVG from "../icons/empty-room.svg";
import emptyHistoryDarkSVG from "../icons/empty-history-dark.svg";
import emptyRoomDarkSVG from "../icons/empty-room-dark.svg";

import React, { useContext } from "react";
import { useTranslate } from "@netless/flat-i18n";
import { DarkModeContext } from "../../../FlatThemeProvider";

export interface RoomListEmptyProps {
    isHistory: boolean;
}

export const RoomListEmpty: React.FC<RoomListEmptyProps> = ({ isHistory }) => {
    const t = useTranslate();
    const darkMode = useContext(DarkModeContext);
    return (
        <div className="room-list-empty">
            <img
                alt="empty"
                src={
                    isHistory
                        ? darkMode
                            ? emptyHistoryDarkSVG
                            : emptyHistorySVG
                        : darkMode
                        ? emptyRoomDarkSVG
                        : emptyRoomSVG
                }
                width={160}
            />
            <span className="room-list-empty-content">
                {isHistory ? t("no-record") : t("no-room")}
            </span>
        </div>
    );
};

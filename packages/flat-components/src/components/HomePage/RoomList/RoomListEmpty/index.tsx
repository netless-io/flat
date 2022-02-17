import "./style.less";
import emptyHistorySVG from "../icons/empty-history.svg";
import emptyRoomSVG from "../icons/empty-room.svg";
import emptyHistoryDarkSVG from "../icons/empty-history-dark.svg";
import emptyRoomDarkSVG from "../icons/empty-room-dark.svg";

import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { DarkModeContext } from "../../../FlatThemeProvider";

export interface RoomListEmptyProps {
    isHistory: boolean;
}

export const RoomListEmpty: React.FC<RoomListEmptyProps> = ({ isHistory }) => {
    const { t } = useTranslation();
    const darkMode = useContext(DarkModeContext);
    return (
        <div className="room-list-empty">
            <img
                alt="empty"
                height="160px"
                src={
                    isHistory
                        ? darkMode
                            ? emptyHistoryDarkSVG
                            : emptyHistorySVG
                        : darkMode
                        ? emptyRoomDarkSVG
                        : emptyRoomSVG
                }
                width="160px"
            />
            <span className="room-list-empty-content">
                {isHistory ? t("no-record") : t("no-room")}
            </span>
        </div>
    );
};

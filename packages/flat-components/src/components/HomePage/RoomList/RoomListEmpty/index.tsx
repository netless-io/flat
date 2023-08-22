import "./style.less";
import EmptyRoomSVG from "../icons/EmptyRoomSVG";
import EmptyHistorySVG from "../icons/EmptyHistorySVG";

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
            {isHistory ? <EmptyHistorySVG isDark={darkMode} /> : <EmptyRoomSVG isDark={darkMode} />}
            <span className="room-list-empty-content">
                {isHistory ? t("no-record") : t("no-room")}
            </span>
        </div>
    );
};

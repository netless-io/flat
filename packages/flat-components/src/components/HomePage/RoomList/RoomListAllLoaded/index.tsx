import "./style.less";

import React from "react";
import { useTranslate } from "@netless/flat-i18n";

export interface RoomListAllLoadedProps {}

export const RoomListAllLoaded: React.FC = () => {
    const t = useTranslate();

    return (
        <div className="room-list-all-loaded">
            <span className="room-list-all-loaded-content">{t("all-loaded")}</span>
        </div>
    );
};

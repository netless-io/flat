import "./style.less";

import React from "react";
import { useTranslation } from "react-i18next";

export interface RoomListAllLoadedProps {}

export const RoomListAllLoaded: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="room-list-all-loaded">
            <span className="room-list-all-loaded-content">{t("all-loaded")}</span>
        </div>
    );
};

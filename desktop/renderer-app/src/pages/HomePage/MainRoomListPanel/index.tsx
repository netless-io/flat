import "./style.less";

import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { RoomList } from "flat-components";
import { MainRoomList } from "./MainRoomList";
import { ListRoomsType } from "../../../api-middleware/flatServer";
import { useTranslation } from "react-i18next";

export const MainRoomListPanel = observer<{}>(function MainRoomListPanel() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<"all" | "today" | "periodic">("all");
    const filters = useMemo<Array<{ key: "all" | "today" | "periodic"; title: string }>>(
        () => [
            {
                key: "all",
                title: t("all"),
            },
            {
                key: "today",
                title: t("today"),
            },
            {
                key: "periodic",
                title: t("periodic"),
            },
        ],
        [t],
    );

    return (
        <RoomList
            title={t("room-list")}
            filters={filters}
            activeTab={activeTab}
            onTabActive={setActiveTab}
        >
            <MainRoomList listRoomsType={activeTab as ListRoomsType} />
        </RoomList>
    );
});

export default MainRoomListPanel;

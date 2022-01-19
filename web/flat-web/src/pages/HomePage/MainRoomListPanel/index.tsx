import React, { useMemo, useState } from "react";
import { RoomList } from "flat-components";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { ListRoomsType } from "../../../api-middleware/flatServer";
import { MainRoomList } from "./MainRoomList";
import "./style.less";

export const MainRoomListPanel = observer<{ isLogin: boolean }>(function MainRoomListPanel({
    isLogin,
}) {
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
            activeTab={activeTab}
            filters={filters}
            title={t("room-list")}
            onTabActive={setActiveTab}
        >
            <MainRoomList isLogin={isLogin} listRoomsType={activeTab as ListRoomsType} />
        </RoomList>
    );
});

export default MainRoomListPanel;

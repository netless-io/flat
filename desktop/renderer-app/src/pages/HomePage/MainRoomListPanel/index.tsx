import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { RoomList } from "flat-components";
import { MainRoomList } from "./MainRoomList";
import { ListRoomsType } from "../../../api-middleware/flatServer";
import { useTranslate } from "@netless/flat-i18n";

export const MainRoomListPanel = observer<{ isLogin: boolean }>(function MainRoomListPanel({
    isLogin,
}) {
    const t = useTranslate();
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

import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { RoomList } from "flat-components";
import { ListRoomsType } from "@netless/flat-server-api";
import { useTranslate } from "@netless/flat-i18n";
import { RoomStore } from "@netless/flat-stores";
import { MainRoomList } from "./MainRoomList";

interface MainRoomListPanelProps {
    roomStore: RoomStore;
    refreshRooms: () => Promise<void>;
}

export const MainRoomListPanel = observer<MainRoomListPanelProps>(function MainRoomListPanel({
    roomStore,
    refreshRooms,
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
            <MainRoomList
                listRoomsType={activeTab as ListRoomsType}
                refreshRooms={refreshRooms}
                roomStore={roomStore}
            />
        </RoomList>
    );
});

export default MainRoomListPanel;

import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { RoomList } from "flat-components";
import { ListRoomsType } from "@netless/flat-server-api";
import { useTranslate } from "@netless/flat-i18n";
import { RoomStore } from "@netless/flat-stores";
import { MainRoomList } from "./MainRoomList";

export type ActiveTabType = Exclude<ListRoomsType, ListRoomsType.History>;

interface MainRoomListPanelProps {
    activeTab: ActiveTabType;
    setActiveTab: (activeTab: ActiveTabType) => void;
    roomStore: RoomStore;
    refreshRooms: () => Promise<void>;
}

export const MainRoomListPanel = observer<MainRoomListPanelProps>(function MainRoomListPanel({
    activeTab,
    setActiveTab,
    roomStore,
    refreshRooms,
}) {
    const t = useTranslate();
    const filters = useMemo<Array<{ key: ActiveTabType; title: string }>>(
        () => [
            {
                key: ListRoomsType.All,
                title: t("all"),
            },
            {
                key: ListRoomsType.Today,
                title: t("today"),
            },
            {
                key: ListRoomsType.Periodic,
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
                listRoomsType={activeTab}
                refreshRooms={refreshRooms}
                roomStore={roomStore}
            />
        </RoomList>
    );
});

export default MainRoomListPanel;

import React, { useContext, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { RoomList } from "flat-components";
import { MainRoomList } from "./MainRoomList";
import { ListRoomsType } from "@netless/flat-server-api";
import { useTranslate } from "@netless/flat-i18n";
import { RoomStoreContext } from "../../components/StoreProvider";

export const MainRoomListPanel = observer<{ isLogin: boolean }>(function MainRoomListPanel({
    isLogin,
}) {
    const t = useTranslate();
    const roomStore = useContext(RoomStoreContext);
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
                isLogin={isLogin}
                listRoomsType={activeTab as ListRoomsType}
                roomStore={roomStore}
            />
        </RoomList>
    );
});

export default MainRoomListPanel;

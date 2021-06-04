import "./style.less";

import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { RoomList } from "flat-components";
import { MainRoomList } from "./MainRoomList";
import { ListRoomsType } from "../../../apiMiddleware/flatServer";

export const MainRoomListPanel = observer<{}>(function MainRoomListPanel() {
    const [activeTab, setActiveTab] = useState<"all" | "today" | "periodic">("all");
    const filters = useMemo<Array<{ key: "all" | "today" | "periodic"; title: string }>>(
        () => [
            {
                key: "all",
                title: "全部",
            },
            {
                key: "today",
                title: "今天",
            },
            {
                key: "periodic",
                title: "周期",
            },
        ],
        [],
    );

    return (
        <RoomList
            title="房间列表"
            filters={filters}
            activeTab={activeTab}
            onTabActive={setActiveTab}
        >
            <MainRoomList listRoomsType={activeTab as ListRoomsType} />
        </RoomList>
    );
});

export default MainRoomListPanel;

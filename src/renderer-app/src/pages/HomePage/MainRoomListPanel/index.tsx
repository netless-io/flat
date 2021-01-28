import "./MainRoomList.less";

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { ListRoomsType } from "../../../apiMiddleware/flatServer";
import { MainRoomListTabs } from "./MainRoomListTabs";
import MainRoomList from "./MainRoomList";

export interface MainRoomListPanelProps {}

export const MainRoomListPanel = observer<MainRoomListPanelProps>(function MainRoomListPanel() {
    const [activeListRoomsType, setActiveListRoomsType] = useState<
        ListRoomsType.All | ListRoomsType.Today | ListRoomsType.Periodic
    >(ListRoomsType.All);

    return (
        <div className="room-list-container">
            <div className="room-list-header">
                <div>
                    <span className="room-list-title">房间列表</span>
                </div>
                <MainRoomListTabs
                    activeListRoomsType={activeListRoomsType}
                    onActiveListRoomsTypeChange={setActiveListRoomsType}
                />
            </div>
            <div className="room-list-line" />
            <div className="room-list-body">
                <MainRoomList listRoomsType={activeListRoomsType} />
            </div>
        </div>
    );
});

export default MainRoomListPanel;

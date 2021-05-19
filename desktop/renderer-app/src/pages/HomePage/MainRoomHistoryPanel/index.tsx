import React from "react";
import { observer } from "mobx-react-lite";
import MainRoomList from "../MainRoomListPanel/MainRoomList";
import { ListRoomsType } from "../../../apiMiddleware/flatServer";

export const MainRoomHistoryPanel = observer<{}>(function MainRoomHistoryPanel() {
    return (
        <div className="room-list-container">
            <div className="room-list-header">
                <div>
                    <span className="room-list-title">历史记录</span>
                </div>
            </div>
            <div className="room-list-line" />
            <div className="room-list-body fancy-scrollbar">
                <MainRoomList listRoomsType={ListRoomsType.History} />
            </div>
        </div>
    );
});

export default MainRoomHistoryPanel;

// import "../MainRoomListPanel/MainRoomList.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { MainRoomList } from "../MainRoomListPanel/MainRoomList";
import { ListRoomsType } from "../../../apiMiddleware/flatServer";
import { RoomList } from "flat-components";

export const MainRoomHistoryPanel = observer<{}>(function MainRoomHistoryPanel() {
    return (
        <RoomList title="历史记录">
            <MainRoomList listRoomsType={ListRoomsType.History} />
        </RoomList>
    );
});

export default MainRoomHistoryPanel;

// import "../MainRoomListPanel/MainRoomList.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { MainRoomList } from "../MainRoomListPanel/MainRoomList";
import { ListRoomsType } from "@netless/flat-server-api";
import { RoomList } from "flat-components";
import { useTranslate } from "@netless/flat-i18n";

export const MainRoomHistoryPanel = observer<{ isLogin: boolean }>(function MainRoomHistoryPanel({
    isLogin,
}) {
    const t = useTranslate();
    return (
        <RoomList title={t("history")}>
            <MainRoomList isLogin={isLogin} listRoomsType={ListRoomsType.History} />
        </RoomList>
    );
});

export default MainRoomHistoryPanel;

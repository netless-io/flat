// import "../MainRoomListPanel/MainRoomList.less";

import React from "react";
import { RoomList } from "flat-components";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { ListRoomsType } from "../../../api-middleware/flatServer";
import { MainRoomList } from "../MainRoomListPanel/MainRoomList";

export const MainRoomHistoryPanel = observer<{ isLogin: boolean }>(function MainRoomHistoryPanel({
    isLogin,
}) {
    const { t } = useTranslation();
    return (
        <RoomList title={t("history")}>
            <MainRoomList isLogin={isLogin} listRoomsType={ListRoomsType.History} />
        </RoomList>
    );
});

export default MainRoomHistoryPanel;

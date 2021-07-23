// import "../MainRoomListPanel/MainRoomList.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { MainRoomList } from "../MainRoomListPanel/MainRoomList";
import { ListRoomsType } from "../../../apiMiddleware/flatServer";
import { RoomList } from "flat-components";
import { useTranslation } from "react-i18next";

export const MainRoomHistoryPanel = observer<{ isLogin: boolean }>(function MainRoomHistoryPanel({
    isLogin,
}) {
    const { t } = useTranslation();
    return (
        <RoomList title={t("history")}>
            <MainRoomList listRoomsType={ListRoomsType.History} isLogin={isLogin} />
        </RoomList>
    );
});

export default MainRoomHistoryPanel;

// import "../MainRoomListPanel/MainRoomList.less";

import React, { useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import { MainRoomList } from "../MainRoomListPanel/MainRoomList";
import { ListRoomsType } from "@netless/flat-server-api";
import { RoomList } from "flat-components";
import { useTranslate } from "@netless/flat-i18n";
import { RoomStoreContext } from "../../components/StoreProvider";

interface MainRoomHistoryPanelProps {
    isLogin: boolean;
}

export const MainRoomHistoryPanel = observer<MainRoomHistoryPanelProps>(
    function MainRoomHistoryPanel({ isLogin }) {
        const t = useTranslate();
        const roomStore = useContext(RoomStoreContext);

        const onScrollToBottom = useCallback((): void => {
            void roomStore.fetchMoreRooms(ListRoomsType.History);
        }, [roomStore]);

        return (
            <RoomList title={t("history")} onScrollToBottom={onScrollToBottom}>
                <MainRoomList
                    isLogin={isLogin}
                    listRoomsType={ListRoomsType.History}
                    roomStore={roomStore}
                />
            </RoomList>
        );
    },
);

export default MainRoomHistoryPanel;

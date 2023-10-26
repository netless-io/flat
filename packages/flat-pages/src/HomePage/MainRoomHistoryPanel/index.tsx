// import "../MainRoomListPanel/MainRoomList.less";

import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { ListRoomsType } from "@netless/flat-server-api";
import { RoomList } from "flat-components";
import { useTranslate } from "@netless/flat-i18n";
import { RoomStore } from "@netless/flat-stores";
import { MainRoomList } from "../MainRoomListPanel/MainRoomList";

interface MainRoomHistoryPanelProps {
    roomStore: RoomStore;
    refreshRooms: () => Promise<void>;
}

export const MainRoomHistoryPanel = observer<MainRoomHistoryPanelProps>(
    function MainRoomHistoryPanel({ roomStore, refreshRooms }) {
        const t = useTranslate();

        const onScrollToBottom = useCallback((): void => {
            void roomStore.fetchMoreRooms(ListRoomsType.History);
        }, [roomStore]);

        return (
            <RoomList title={t("history")} onScrollToBottom={onScrollToBottom}>
                <MainRoomList
                    listRoomsType={ListRoomsType.History}
                    refreshRooms={refreshRooms}
                    roomStore={roomStore}
                />
            </RoomList>
        );
    },
);

export default MainRoomHistoryPanel;

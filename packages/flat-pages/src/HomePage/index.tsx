import "./style.less";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { ListRoomsType } from "@netless/flat-server-api";
import { errorTips, useSafePromise } from "flat-components";
import { MainRoomMenu } from "./MainRoomMenu";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { useLoginCheck } from "../utils/use-login-check";
import { PageStoreContext, RoomStoreContext } from "../components/StoreProvider";
import { AppUpgradeModal } from "../components/AppUpgradeModal";

export const HomePage = observer(function HomePage() {
    const sp = useSafePromise();
    const pageStore = useContext(PageStoreContext);
    const roomStore = useContext(RoomStoreContext);

    const [activeTab, setActiveTab] = useState<"all" | "today" | "periodic">("all");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    const isLogin = useLoginCheck();

    const refreshRooms = useCallback(
        async function refreshRooms() {
            try {
                await Promise.all([
                    sp(roomStore.listRooms(activeTab as ListRoomsType)),
                    sp(roomStore.listRooms(ListRoomsType.History)),
                ]);
            } catch (e) {
                errorTips(e);
            }
        },
        [activeTab, roomStore, sp],
    );

    useEffect(() => {
        if (!isLogin) {
            return;
        }

        void refreshRooms();

        const ticket = window.setInterval(refreshRooms, 30 * 1000);

        return () => {
            window.clearInterval(ticket);
        };
    }, [refreshRooms, isLogin]);

    return (
        <div className="homepage-layout-horizontal-container">
            <MainRoomMenu />
            <div className="homepage-layout-horizontal-content">
                <MainRoomListPanel
                    activeTab={activeTab}
                    refreshRooms={refreshRooms}
                    roomStore={roomStore}
                    setActiveTab={setActiveTab}
                />
                <MainRoomHistoryPanel refreshRooms={refreshRooms} roomStore={roomStore} />
            </div>
            <AppUpgradeModal />
        </div>
    );
});

export default HomePage;

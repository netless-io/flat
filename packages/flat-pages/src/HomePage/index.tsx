import "./style.less";

import React, { useCallback, useContext, useEffect } from "react";
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    const isLogin = useLoginCheck();

    // If you stop a class, it will "fly to" the history list,
    // which means we need 2 refresh list api calls here.
    const refreshRooms = useCallback(
        async function refreshRooms() {
            try {
                await Promise.all([
                    sp(roomStore.listRooms(ListRoomsType.All)),
                    sp(roomStore.listRooms(ListRoomsType.History)),
                ]);
            } catch (e) {
                errorTips(e);
            }
        },
        [roomStore, sp],
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
                <MainRoomListPanel refreshRooms={refreshRooms} roomStore={roomStore} />
                <MainRoomHistoryPanel refreshRooms={refreshRooms} roomStore={roomStore} />
            </div>
            <AppUpgradeModal />
        </div>
    );
});

export default HomePage;

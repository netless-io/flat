import "./style.less";

import React, { useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { MainRoomMenu } from "./MainRoomMenu";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { useLoginCheck } from "../utils/use-login-check";
import { PageStoreContext } from "../components/StoreProvider";

export const HomePage = observer(function HomePage() {
    const isLogin = useLoginCheck();

    const pageStore = useContext(PageStoreContext);
    useEffect(() => pageStore.configure(), []);

    return (
        <div className="homepage-layout-horizontal-container">
            <MainRoomMenu />
            <div className="homepage-layout-horizontal-content">
                <MainRoomListPanel isLogin={isLogin} />
                <MainRoomHistoryPanel isLogin={isLogin} />
            </div>
        </div>
    );
});

export default HomePage;

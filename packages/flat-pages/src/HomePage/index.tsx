import "./style.less";

import React, { useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { MainRoomMenu } from "./MainRoomMenu";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { PageStoreContextLegacy } from "../components/PageStoreContextLegacy";
import { useLoginCheck } from "../utils/use-login-check";

export const HomePage = observer(function HomePage() {
    const pageStoreLegacy = useContext(PageStoreContextLegacy);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStoreLegacy.configure(), []);

    const isLogin = useLoginCheck();

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

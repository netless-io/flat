import "./style.less";

import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { MainRoomMenu } from "./MainRoomMenu";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext, PageStoreContext } from "../../components/StoreProvider";
import { loginCheck } from "../../apiMiddleware/flatServer";
import { errorTips } from "../../components/Tips/ErrorTips";

export const HomePage = observer(function HomePage() {
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const pageStore = useContext(PageStoreContext);
    const [isLogin, setIsLogin] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    useEffect(() => {
        let isUnMount = false;

        async function checkLogin(): Promise<boolean> {
            if (!globalStore.userInfo?.token) {
                return false;
            }

            if (globalStore.lastLoginCheck) {
                if (Date.now() - globalStore.lastLoginCheck < 2 * 60 * 60 * 1000) {
                    return true;
                }
            }

            try {
                await loginCheck();
                globalStore.lastLoginCheck = Date.now();
                return true;
            } catch (e) {
                globalStore.lastLoginCheck = null;
                console.error(e);
                errorTips(e);
            }

            return false;
        }

        void checkLogin().then(isLoggedIn => {
            if (!isUnMount) {
                if (isLoggedIn) {
                    setIsLogin(true);
                } else {
                    pushHistory(RouteNameType.LoginPage);
                }
            }
        });

        return () => {
            isUnMount = true;
        };
        // Only check login once on start
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

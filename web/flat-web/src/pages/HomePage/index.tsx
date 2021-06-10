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
    const [loading, setLoading] = useState(true);

    (window as any).pageStore = pageStore;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    useEffect(() => {
        let isUnMount = false;

        async function checkLogin(): Promise<RouteNameType.HomePage | RouteNameType.LoginPage> {
            let nextPage = RouteNameType.LoginPage;

            const token = globalStore.userInfo?.token;
            if (token) {
                try {
                    await loginCheck();
                    nextPage = RouteNameType.HomePage;
                } catch (e) {
                    console.error(e);
                    errorTips(e);
                }
            }

            return nextPage;
        }

        void checkLogin().then(nextPage => {
            if (!isUnMount) {
                if (nextPage !== RouteNameType.HomePage) {
                    pushHistory(nextPage);
                } else {
                    setLoading(false);
                }
            }
        });

        return () => {
            isUnMount = true;
        };
        // Only check login once on start
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return null;
    }

    return (
        <div className="homepage-layout-horizontal-container">
            <MainRoomMenu />
            <div className="homepage-layout-horizontal-content">
                <MainRoomListPanel />
                <MainRoomHistoryPanel />
            </div>
        </div>
    );
});

export default HomePage;

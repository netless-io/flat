import "./style.less";

import React, { useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { MainRoomMenu } from "./MainRoomMenu";
import { MainPageLayoutHorizontalContainer } from "../../components/MainPageLayoutHorizontalContainer";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { loginCheck } from "../../apiMiddleware/flatServer";
import { errorTips } from "../../components/Tips/ErrorTips";

export const HomePage = observer(function HomePage() {
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);

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

            // if (!isUnMount) {
            //     updateLoginStatus(LoginStatusType.Success);
            // }

            return nextPage;
        }

        void Promise.all([checkLogin()]).then(([nextPage]) => {
            if (!isUnMount) {
                if (nextPage !== RouteNameType.HomePage) {
                    pushHistory(nextPage);
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
        <MainPageLayoutHorizontalContainer>
            <div className="homepage-layout-horizontal-container">
                <MainRoomMenu />
                <div className="homepage-layout-horizontal-content">
                    <MainRoomListPanel />
                    <MainRoomHistoryPanel />
                </div>
            </div>
        </MainPageLayoutHorizontalContainer>
    );
});

export default HomePage;

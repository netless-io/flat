import React, { useEffect, useState } from "react";
import { differenceInHours } from "date-fns";
import { constants } from "flat-types";
import { observer } from "mobx-react-lite";
import { useLastLocation } from "react-router-last-location";
import { loginCheck } from "../../api-middleware/flatServer";
import { AppUpgradeModal, AppUpgradeModalProps } from "../../components/AppUpgradeModal";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { errorTips } from "../../components/Tips/ErrorTips";
import { globalStore } from "../../stores/global-store";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { ipcAsyncByMainWindow, ipcSyncByApp } from "../../utils/ipc";
import { RouteNameType, useReplaceHistory } from "../../utils/routes";
import { runtime } from "../../utils/runtime";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomMenu } from "./MainRoomMenu";
import { shouldWindowCenter } from "./utils";
import "./HomePage.less";

export type HomePageProps = {};

export const HomePage = observer<HomePageProps>(function HomePage() {
    const replaceHistory = useReplaceHistory();
    const lastLocation = useLastLocation();
    const [updateInfo, setUpdateInfo] = useState<AppUpgradeModalProps["updateInfo"]>(null);
    const sp = useSafePromise();
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        ipcAsyncByMainWindow("set-win-size", {
            ...constants.PageSize.Main,
            autoCenter: shouldWindowCenter(lastLocation?.pathname),
        });
    }, [lastLocation]);

    useEffect(() => {
        // check for updates only here
        const checkUpdateVisible =
            differenceInHours(new Date().getTime(), globalStore.checkNewVersionDate) >= 1;

        if (checkUpdateVisible) {
            sp(ipcSyncByApp("get-update-info"))
                .then(data => {
                    console.log("[Auto Updater]: Get Update Info");
                    if (data.hasNewVersion) {
                        console.log(
                            `[Auto Updater]: Remote Version "${data.version}", Local Version "${runtime.appVersion}"`,
                        );
                        if (data.version !== runtime.appVersion) {
                            setUpdateInfo(data);
                        }
                    }
                })
                .catch(err => {
                    console.error("ipc failed", err);
                });
            globalStore.updateCheckNewVersionDate();
        }
    }, [sp]);

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
                errorTips(e as Error);
            }

            return false;
        }

        void checkLogin().then(isLoggedIn => {
            if (!isUnMount) {
                if (isLoggedIn) {
                    setIsLogin(true);
                } else {
                    replaceHistory(RouteNameType.LoginPage);
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
        <MainPageLayoutContainer>
            <div className="homepage-layout-container">
                <MainRoomMenu />
                <div className="homepage-layout-content">
                    <MainRoomListPanel isLogin={isLogin} />
                    <MainRoomHistoryPanel isLogin={isLogin} />
                </div>
            </div>
            <AppUpgradeModal updateInfo={updateInfo} onClose={() => setUpdateInfo(null)} />
        </MainPageLayoutContainer>
    );
});

export default HomePage;

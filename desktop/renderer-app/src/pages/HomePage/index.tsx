import "./HomePage.less";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { ipcAsyncByMainWindow, ipcSyncByApp } from "../../utils/ipc";
import { MainRoomMenu } from "./MainRoomMenu";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { useLastLocation } from "react-router-last-location";
import { shouldWindowCenter } from "./utils";
import { constants } from "flat-types";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { AppUpgradeModal } from "../../components/AppUpgradeModal";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { runtime } from "../../utils/runtime";
import { globalStore } from "../../stores/GlobalStore";
import { differenceInHours } from "date-fns";

export type HomePageProps = {};

export const HomePage = observer<HomePageProps>(function HomePage() {
    const lastLocation = useLastLocation();
    const [newVersion, setNewVersion] = useState<string>();
    const sp = useSafePromise();

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
                            setNewVersion(data.version);
                        }
                    }
                })
                .catch(err => {
                    console.error("ipc failed", err);
                });
            globalStore.updateCheckNewVersionDate();
        }
    }, [sp]);

    return (
        <MainPageLayoutContainer>
            <div className="homepage-layout-container">
                <MainRoomMenu />
                <div className="homepage-layout-content">
                    <MainRoomListPanel />
                    <MainRoomHistoryPanel />
                </div>
            </div>
            <AppUpgradeModal newVersion={newVersion} onClose={() => setNewVersion(void 0)} />
        </MainPageLayoutContainer>
    );
});

export default HomePage;

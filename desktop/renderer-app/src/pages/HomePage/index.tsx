import { differenceInHours } from "date-fns";
import { constants } from "flat-types";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useLastLocation } from "react-router-last-location";
import { AppUpgradeModal } from "../../components/AppUpgradeModal";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { globalStore } from "../../stores/GlobalStore";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { ipcAsyncByMainWindow, ipcReceive, ipcReceiveRemove, ipcSyncByApp } from "../../utils/ipc";
import { usePushHistory } from "../../utils/routes";
import { runtime } from "../../utils/runtime";
import { joinRoomHandler } from "../utils/joinRoomHandler";
import "./HomePage.less";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomMenu } from "./MainRoomMenu";
import { shouldWindowCenter } from "./utils";

export type HomePageProps = {};

export const HomePage = observer<HomePageProps>(function HomePage() {
    const lastLocation = useLastLocation();
    const [newVersion, setNewVersion] = useState<string>();
    const pushHistory = usePushHistory();
    const sp = useSafePromise();

    useEffect(() => {
        ipcAsyncByMainWindow("set-win-size", {
            ...constants.PageSize.Main,
            autoCenter: shouldWindowCenter(lastLocation?.pathname),
        });
    }, [lastLocation]);

    useEffect(() => {
        ipcReceive("join-room", ({ roomUUID }) => {
            void joinRoomHandler(roomUUID, pushHistory);
        });

        return () => {
            ipcReceiveRemove("join-room");
        };
    }, [pushHistory]);

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

import "./HomePage.less";

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ipcAsyncByMainWindow } from "../../utils/ipc";
import MainPageLayout from "../../components/MainPageLayout";
import { MainRoomMenu } from "./MainRoomMenu";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { useLastLocation } from "react-router-last-location";
import { shouldWindowCenter } from "./utils";
import { constants } from "flat-types";

export type HomePageProps = {};

export const HomePage = observer<HomePageProps>(function HomePage() {
    const lastLocation = useLastLocation();

    useEffect(() => {
        ipcAsyncByMainWindow("set-win-size", {
            ...constants.PageSize.Main,
            autoCenter: shouldWindowCenter(lastLocation?.pathname),
        });
    }, [lastLocation]);

    return (
        <MainPageLayout columnLayout>
            <MainRoomMenu />
            <div className="main-room-layout">
                <MainRoomListPanel />
                <MainRoomHistoryPanel />
            </div>
        </MainPageLayout>
    );
});

export default HomePage;

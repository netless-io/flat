import "./HomePage.less";

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ipcAsyncByMain } from "../../utils/ipc";
import MainPageLayout from "../../components/MainPageLayout";
import { MainRoomMenu } from "./MainRoomMenu";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { useLastLocation } from "react-router-last-location";
import { shouldWindowCenter } from "./utils";

export type HomePageProps = {};

export const HomePage = observer<HomePageProps>(function HomePage() {
    const lastLocation = useLastLocation();

    useEffect(() => {
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 668,
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

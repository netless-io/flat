import "./HomePage.less";

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ipcAsyncByMainWindow } from "../../utils/ipc";
import { MainRoomMenu } from "./MainRoomMenu";
import { MainRoomListPanel } from "./MainRoomListPanel";
import { MainRoomHistoryPanel } from "./MainRoomHistoryPanel";
import { useLastLocation } from "react-router-last-location";
import { shouldWindowCenter } from "./utils";
import { constants } from "flat-types";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";

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
        <MainPageLayoutContainer>
            <div className="homepage-layout-container">
                <MainRoomMenu />
                <div className="homepage-layout-content">
                    <MainRoomListPanel />
                    <MainRoomHistoryPanel />
                </div>
            </div>
        </MainPageLayoutContainer>
    );
});

export default HomePage;

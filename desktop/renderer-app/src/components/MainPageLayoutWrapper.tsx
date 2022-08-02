import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { MainPageLayoutContainer } from "./MainPageLayoutContainer";
import { PageStoreContext } from "@netless/flat-pages/src/components/StoreProvider";
import { routeConfig } from "../route-config";
import { matchPath, useLocation } from "react-router-dom";

export const MainPageLayoutWrapper = observer(function MainPageLayoutWrap({ children }) {
    const pageStore = useContext(PageStoreContext);
    const location = useLocation();

    const hasHeader = (routePath: string): boolean => {
        return [
            routeConfig.RoomDetailPage,
            routeConfig.PeriodicRoomDetailPage,
            routeConfig.ModifyOrdinaryRoomPage,
            routeConfig.ModifyPeriodicRoomPage,
            routeConfig.UserScheduledPage,
        ].some(({ path }) => {
            return !!matchPath(routePath, {
                path,
                sensitive: true,
            });
        });
    };

    return (
        <MainPageLayoutContainer
            MainPageHeaderTitle={pageStore.title}
            activeKeys={pageStore.activeKeys}
            showMainPageHeader={hasHeader(location.pathname)}
            subMenu={pageStore.subMenu}
            onBackPreviousPage={pageStore.onBackPreviousPage}
            onRouteChange={pageStore.onRouteChange}
        >
            {children}
        </MainPageLayoutContainer>
    );
});

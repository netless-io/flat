import React, { useContext, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { MainPageLayoutContainer } from "./MainPageLayoutContainer";
import { PageStoreContext } from "@netless/flat-pages/src/components/StoreProvider";
import { routeConfig } from "../route-config";
import { matchPath, useLocation } from "react-router-dom";

export const MainPageLayoutWrapper = observer(function MainPageLayoutWrap({ children }) {
    const pageStore = useContext(PageStoreContext);
    const location = useLocation();

    const hasHeader = useMemo((): boolean => {
        return [
            routeConfig.RoomDetailPage,
            routeConfig.PeriodicRoomDetailPage,
            routeConfig.ModifyOrdinaryRoomPage,
            routeConfig.ModifyPeriodicRoomPage,
            routeConfig.UserScheduledPage,
        ].some(({ path }) => {
            return !!matchPath(location.pathname, {
                path,
                sensitive: true,
            });
        });
    }, [location.pathname]);

    const isClassPage = useMemo((): boolean => {
        return [
            routeConfig.BigClassPage,
            routeConfig.SmallClassPage,
            routeConfig.OneToOnePage,
            routeConfig.ReplayPage,
            routeConfig.AIPage,
        ].some(({ path }) => {
            return !!matchPath(location.pathname, {
                path,
                sensitive: true,
            });
        });
    }, [location.pathname]);

    return isClassPage ? (
        <>{children}</>
    ) : (
        <MainPageLayoutContainer
            MainPageHeaderTitle={pageStore.title}
            activeKeys={pageStore.activeKeys}
            showMainPageHeader={hasHeader}
            subMenu={pageStore.subMenu}
            onBackPreviousPage={pageStore.onBackPreviousPage}
            onRouteChange={pageStore.onRouteChange}
        >
            {children}
        </MainPageLayoutContainer>
    );
});

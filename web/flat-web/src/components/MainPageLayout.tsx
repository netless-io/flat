import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { MainPageLayoutHorizontalContainer } from "./MainPageLayoutHorizontalContainer";
import { routePages } from "../AppRoutes/route-pages";
import { PageStoreContext } from "./StoreProvider";

export const MainPageLayout = observer(function MainPageLayout({ children }) {
    const pageStore = useContext(PageStoreContext);
    const hasHeader = pageStore.name && routePages[pageStore.name].hasHeader;
    return hasHeader ? (
        <MainPageLayoutHorizontalContainer
            title={pageStore.title}
            subMenu={pageStore.subMenu}
            activeKeys={pageStore.activeKeys}
            onRouteChange={pageStore.onRouteChange}
            onBackPreviousPage={pageStore.onBackPreviousPage}
        >
            {children}
        </MainPageLayoutHorizontalContainer>
    ) : (
        <>{children}</>
    );
});

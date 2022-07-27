import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { MainPageLayoutHorizontalContainer } from "./MainPageLayoutHorizontalContainer";
import { routePages } from "../AppRoutes/route-pages";
import { PageStoreContextLegacy } from "./PageStoreContextLegacy";

export const MainPageLayout = observer(function MainPageLayout({ children }) {
    const pageStoreLegacy = useContext(PageStoreContextLegacy);
    const hasHeader = pageStoreLegacy.name && routePages[pageStoreLegacy.name].hasHeader;
    return hasHeader ? (
        <MainPageLayoutHorizontalContainer
            activeKeys={pageStoreLegacy.activeKeys}
            subMenu={pageStoreLegacy.subMenu}
            title={pageStoreLegacy.title}
            onBackPreviousPage={pageStoreLegacy.onBackPreviousPage}
            onRouteChange={pageStoreLegacy.onRouteChange}
        >
            {children}
        </MainPageLayoutHorizontalContainer>
    ) : (
        <>{children}</>
    );
});

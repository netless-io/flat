import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { FlatThemeProvider } from "flat-components";
import { MainPageLayoutHorizontalContainer } from "./MainPageLayoutHorizontalContainer";
import { routePages } from "../AppRoutes/route-pages";
import { ConfigStoreContext, PageStoreContext } from "./StoreProvider";

export const MainPageLayout = observer(function MainPageLayout({ children }) {
    const pageStore = useContext(PageStoreContext);
    const configStore = useContext(ConfigStoreContext);
    const hasHeader = pageStore.name && routePages[pageStore.name].hasHeader;
    return (
        <FlatThemeProvider prefersColorScheme={configStore.prefersColorScheme}>
            {hasHeader ? (
                <MainPageLayoutHorizontalContainer
                    activeKeys={pageStore.activeKeys}
                    subMenu={pageStore.subMenu}
                    title={pageStore.title}
                    onBackPreviousPage={pageStore.onBackPreviousPage}
                    onRouteChange={pageStore.onRouteChange}
                >
                    {children}
                </MainPageLayoutHorizontalContainer>
            ) : (
                <>{children}</>
            )}
        </FlatThemeProvider>
    );
});

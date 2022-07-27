import loadable from "@loadable/component";
import React, { ComponentType, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps, useLocation } from "react-router-dom";
import { useIsomorphicLayoutEffect } from "react-use";
import { FlatThemeBodyProvider, LoadingPage } from "flat-components";
import { PreferencesStoreContext } from "../components/StoreProvider";
import { RouteNameType } from "../route-config";
import { AppRouteErrorBoundary } from "./AppRouteErrorBoundary";
import { routePages } from "./route-pages";
import { observer } from "mobx-react-lite";
import { PageStoreContextLegacy } from "../components/PageStoreContextLegacy";
import { PageStoreContext } from "../components/PageStoreContext";

export interface AppRouteContainerProps {
    name: RouteNameType;
    Comp: () => Promise<{ default: ComponentType<any> }>;
    title: string;
    routeProps: RouteComponentProps;
}

const componentCache = new Map<RouteNameType, ComponentType<any>>();
// Preload components every 2 seconds.
const preloadComponents = async (): Promise<void> => {
    for (const name of Object.keys(routePages) as RouteNameType[]) {
        if (!componentCache.has(name)) {
            const { default: Component } = await routePages[name].component();
            componentCache.set(name, Component);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
};
window.setTimeout(preloadComponents, 5000);

export const AppRouteContainer = observer<AppRouteContainerProps>(function AppRouteContainer({
    name,
    Comp,
    title,
    routeProps,
}) {
    const pageStoreLegacy = useContext(PageStoreContextLegacy);
    const pageStore = useContext(PageStoreContext);
    const preferencesStore = useContext(PreferencesStoreContext);
    const { t } = useTranslation();
    const location = useLocation();

    useIsomorphicLayoutEffect(() => {
        pageStoreLegacy.setName(name);
    }, [name, pageStoreLegacy]);

    useEffect(() => {
        document.title = t("title-" + title);

        // clear selection
        window.getSelection()?.removeAllRanges();
    }, [t, title]);

    useEffect(() => {
        if (!componentCache.has(name)) {
            Comp().then(({ default: Component }) => {
                componentCache.set(name, Component);
            });
        }
    }, [Comp, name]);

    useEffect(() => {
        pageStore.configure(location.pathname);
    }, [location.pathname, pageStore]);

    const hasHeader =
        pageStoreLegacy.name !== null &&
        pageStoreLegacy.name &&
        routePages[pageStoreLegacy.name].hasHeader;

    return (
        <FlatThemeBodyProvider prefersColorScheme={preferencesStore.prefersColorScheme}>
            <AppRouteErrorBoundary
                Comp={
                    componentCache.get(name) ||
                    loadable(Comp, {
                        fallback: <LoadingPage hasHeader={hasHeader} />,
                    })
                }
                {...{ title, routeProps }}
            />
        </FlatThemeBodyProvider>
    );
});

import React, { ComponentType, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import loadable from "@loadable/component";
import { useTranslate } from "@netless/flat-i18n";
import { FlatThemeBodyProvider, LoadingPage } from "flat-components";
import { RouteComponentProps } from "react-router-dom";
import { useIsomorphicLayoutEffect } from "react-use";
import { PageStoreContext, PreferencesStoreContext } from "../components/StoreProvider";
import { RouteNameType } from "../route-config";
import { isWeChatBrowser } from "../utils/user-agent";
import { AppRouteErrorBoundary } from "./AppRouteErrorBoundary";
import { routePages } from "./route-pages";
import { WeChatRedirect } from "./WeChatRedirect";

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
    const pageStore = useContext(PageStoreContext);
    const preferencesStore = useContext(PreferencesStoreContext);
    const t = useTranslate();

    useIsomorphicLayoutEffect(() => {
        pageStore.setName(name);
    }, [name, pageStore]);

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

    const hasHeader =
        pageStore.name !== null && pageStore.name && routePages[pageStore.name].hasHeader;

    const pathname = routeProps.location.pathname;
    if (isWeChatBrowser && !pathname.startsWith("/join/") && !pathname.startsWith("/replay/")) {
        return <WeChatRedirect />;
    }

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

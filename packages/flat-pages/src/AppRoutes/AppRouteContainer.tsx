import React, { ComponentType, useContext, useEffect, lazy, Suspense } from "react";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { FlatThemeBodyProvider, LoadingPage } from "flat-components";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { useIsomorphicLayoutEffect } from "react-use";
import { PageStoreContext, PreferencesStoreContext } from "../components/StoreProvider";
import { RouteNameType } from "../route-config";
import { isWeChatBrowser } from "../utils/user-agent";
import { AppRouteErrorBoundary } from "./AppRouteErrorBoundary";
import { routePages } from "./route-pages";
import { WeChatRedirect } from "./WeChatRedirect";

export interface AppRouteContainerProps {
    name: RouteNameType;
    title: string;
    routeProps: RouteComponentProps;
}

const lazyPages: Record<string, ComponentType<any>> = {};
for (const name of Object.keys(routePages) as RouteNameType[]) {
    lazyPages[name] = lazy(routePages[name].component);
}

export const AppRouteContainer = observer<AppRouteContainerProps>(function AppRouteContainer({
    name,
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

    const hasHeader =
        pageStore.name !== null && pageStore.name && routePages[pageStore.name].hasHeader;

    const pathname = routeProps.location.pathname;
    if (isWeChatBrowser && !pathname.startsWith("/join/") && !pathname.startsWith("/replay/")) {
        return <WeChatRedirect />;
    }

    const Page = lazyPages[name];
    if (!Page) {
        console.error(`Page not found: ${name}`);
        return <Redirect to="/" />;
    }

    return (
        <FlatThemeBodyProvider prefersColorScheme={preferencesStore.prefersColorScheme}>
            <AppRouteErrorBoundary>
                <Suspense fallback={<LoadingPage hasHeader={hasHeader} />}>
                    <Page {...routeProps} />
                </Suspense>
            </AppRouteErrorBoundary>
        </FlatThemeBodyProvider>
    );
});

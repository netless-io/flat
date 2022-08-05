import { observer } from "mobx-react-lite";
import React from "react";
import { useTranslate } from "@netless/flat-i18n";
import { HashRouter, Route, Switch } from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { MainPageLayoutWrapper } from "../components/MainPageLayoutWrapper";
import { RouteConfig, routeConfig } from "../route-config";
import { AppRouteContainer } from "./AppRouteContainer";

export const AppRoutes = observer(function AppRoutes() {
    const t = useTranslate();

    return (
        <HashRouter>
            <MainPageLayoutWrapper>
                <LastLocationProvider watchOnlyPathname>
                    <Switch>
                        {Object.keys(routeConfig).map(((name: keyof RouteConfig) => {
                            const { path, component, title } = routeConfig[name];
                            return (
                                <Route
                                    key={name}
                                    exact={true}
                                    path={path}
                                    render={routeProps => (
                                        <AppRouteContainer
                                            key={routeProps.location.pathname}
                                            Comp={component}
                                            routeProps={routeProps}
                                            title={t("title-" + title)}
                                        />
                                    )}
                                />
                            );
                        }) as (name: string) => React.ReactElement)}
                    </Switch>
                </LastLocationProvider>
            </MainPageLayoutWrapper>
        </HashRouter>
    );
});

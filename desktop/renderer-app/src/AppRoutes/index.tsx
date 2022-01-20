import { FlatThemeProvider } from "flat-components";
import React, { FC, useContext } from "react";
import { useTranslation } from "react-i18next";
import { HashRouter, Route, Switch } from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { ConfigStoreContext } from "../components/StoreProvider";
import { RouteConfig, routeConfig } from "../route-config";
import { AppRouteContainer } from "./AppRouteContainer";

export const AppRoutes: FC = () => {
    const { t } = useTranslation();
    const configStore = useContext(ConfigStoreContext);

    return (
        <HashRouter>
            <LastLocationProvider watchOnlyPathname>
                <FlatThemeProvider prefersColorScheme={configStore.prefersColorScheme}>
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
                </FlatThemeProvider>
            </LastLocationProvider>
        </HashRouter>
    );
};

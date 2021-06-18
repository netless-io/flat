import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { HashRouter, Route, Switch } from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { RouteConfig, routeConfig } from "../route-config";
import { AppRouteContainer } from "./AppRouteContainer";

export const AppRoutes: FC = () => {
    const { t } = useTranslation();
    return (
        <HashRouter>
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
                                        Comp={component}
                                        title={t("title-" + title)}
                                        routeProps={routeProps}
                                    />
                                )}
                            />
                        );
                    }) as (name: string) => React.ReactElement)}
                </Switch>
            </LastLocationProvider>
        </HashRouter>
    );
};

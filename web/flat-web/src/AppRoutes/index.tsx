import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { RouteConfig, routeConfig } from "../route-config";
import { AppRouteContainer } from "./AppRouteContainer";
import { routePages } from "./route-pages";

export const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <LastLocationProvider watchOnlyPathname>
                <Switch>
                    {Object.keys(routeConfig).map(((name: keyof RouteConfig) => {
                        const { path } = routeConfig[name];
                        const { component, title } = routePages[name];
                        return (
                            <Route
                                key={name}
                                exact={true}
                                path={path}
                                render={routeProps => (
                                    <AppRouteContainer
                                        Comp={component}
                                        title={title}
                                        routeProps={routeProps}
                                    />
                                )}
                            />
                        );
                    }) as (name: string) => React.ReactElement)}
                </Switch>
            </LastLocationProvider>
        </BrowserRouter>
    );
};

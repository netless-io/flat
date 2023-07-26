import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { MainPageLayout } from "../components/MainPageLayout";
import { RouteConfig, routeConfig } from "../route-config";
import { AppRouteContainer } from "./AppRouteContainer";
import { routePages } from "./route-pages";

export const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <LastLocationProvider watchOnlyPathname>
                <MainPageLayout>
                    <Switch>
                        {Object.keys(routeConfig).map(((name: keyof RouteConfig) => {
                            const { path } = routeConfig[name];
                            const { title } = routePages[name];
                            return (
                                <Route
                                    key={name}
                                    exact={true}
                                    path={path}
                                    render={routeProps => {
                                        return (
                                            <AppRouteContainer
                                                key={routeProps.location.pathname}
                                                name={name}
                                                routeProps={routeProps}
                                                title={title}
                                            />
                                        );
                                    }}
                                />
                            );
                        }) as (name: string) => React.ReactElement)}
                    </Switch>
                </MainPageLayout>
            </LastLocationProvider>
        </BrowserRouter>
    );
};

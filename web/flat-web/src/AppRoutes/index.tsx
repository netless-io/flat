import { FlatThemeProvider } from "flat-components";
import React, { useContext } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { ConfigStoreContext } from "../components/StoreProvider";
import { MainPageLayout } from "../components/MainPageLayout";
import { RouteConfig, routeConfig } from "../route-config";
import { AppRouteContainer } from "./AppRouteContainer";
import { routePages } from "./route-pages";

export const AppRoutes: React.FC = () => {
    const configStore = useContext(ConfigStoreContext);
    return (
        <BrowserRouter>
            <LastLocationProvider watchOnlyPathname>
                <FlatThemeProvider prefersColorScheme={configStore.prefersColorScheme}>
                    <MainPageLayout>
                        <Switch>
                            {Object.keys(routeConfig).map(((name: keyof RouteConfig) => {
                                const { path } = routeConfig[name];
                                const { component, title } = routePages[name];
                                return (
                                    <Route
                                        key={name}
                                        exact={true}
                                        path={path}
                                        render={routeProps => {
                                            return (
                                                <AppRouteContainer
                                                    key={routeProps.location.pathname}
                                                    Comp={component}
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
                </FlatThemeProvider>
            </LastLocationProvider>
        </BrowserRouter>
    );
};

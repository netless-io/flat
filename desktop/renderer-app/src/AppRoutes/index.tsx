import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { message } from "antd";
import { LastLocationProvider } from "react-router-last-location";
import { RouteConfig, routeConfig } from "../route-config";
import { AppRouteContainer } from "./AppRouteContainer";
import { I18nextProvider } from "react-i18next";
import { i18n } from "../utils/i18n";

export class AppRoutes extends React.Component {
    public componentDidCatch(error: any): void {
        void message.error(`网页加载发生错误：${error}`);
    }

    public render(): React.ReactElement {
        return (
            <HashRouter>
                <I18nextProvider i18n={i18n}>
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
                                                title={title}
                                                routeProps={routeProps}
                                            />
                                        )}
                                    />
                                );
                            }) as (name: string) => React.ReactElement)}
                        </Switch>
                    </LastLocationProvider>
                </I18nextProvider>
            </HashRouter>
        );
    }
}

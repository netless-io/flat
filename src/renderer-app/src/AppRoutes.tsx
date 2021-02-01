import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Route, Switch } from "react-router";
import { message } from "antd";
import { RouteConfig, routeConfig } from "./route-config";

export class AppRoutes extends React.Component {
    public componentDidCatch(error: any): void {
        message.error(`网页加载发生错误：${error}`);
    }

    public render(): React.ReactElement {
        return (
            <BrowserRouter>
                <Switch>
                    {Object.keys(routeConfig).map(((name: keyof RouteConfig) => {
                        const { path, component, title } = routeConfig[name];
                        return (
                            <Route
                                key={name}
                                exact={true}
                                path={path}
                                render={routeProps => {
                                    document.title = title;
                                    const Comp = component as React.ComponentType<any>;
                                    return <Comp {...routeProps} />;
                                }}
                            />
                        );
                    }) as (name: string) => React.ReactElement)}
                </Switch>
            </BrowserRouter>
        );
    }
}

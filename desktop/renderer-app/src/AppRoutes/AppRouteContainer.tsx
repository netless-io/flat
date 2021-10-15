import React, { FC } from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import { RouteComponentProps } from "react-router-dom";
import { ipcAsyncByMainWindow } from "../utils/ipc";
import { AppRouteErrorBoundary } from "./AppRouteErrorBoundary";
import { useURLAppLauncher } from "../utils/hooks/use-url-app-launcher";

export interface AppRouteContainerProps {
    Comp: React.ComponentType<any>;
    title: string;
    routeProps: RouteComponentProps;
}

export const AppRouteContainer: FC<AppRouteContainerProps> = ({ Comp, title, routeProps }) => {
    useURLAppLauncher();

    useIsomorphicLayoutEffect(() => {
        const compName = Comp.displayName || Comp.name;
        // @TODO i18n
        document.title =
            title + (process.env.NODE_ENV === "development" && compName ? ` (${compName})` : "");
        ipcAsyncByMainWindow("set-title", {
            title: document.title,
        });

        // clear selection
        window.getSelection()?.removeAllRanges();
    }, []);

    return <AppRouteErrorBoundary Comp={Comp} {...{ title, routeProps }} />;
};

export default AppRouteContainer;

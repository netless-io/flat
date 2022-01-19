import React, { useContext } from "react";
import { FlatThemeBodyProvider } from "flat-components";
import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router-dom";
import { useIsomorphicLayoutEffect } from "react-use";
import { ConfigStoreContext } from "../components/StoreProvider";
import { useURLAppLauncher } from "../utils/hooks/use-url-app-launcher";
import { ipcAsyncByMainWindow } from "../utils/ipc";
import { AppRouteErrorBoundary } from "./AppRouteErrorBoundary";

export interface AppRouteContainerProps {
    Comp: React.ComponentType<any>;
    title: string;
    routeProps: RouteComponentProps;
}

export const AppRouteContainer = observer<AppRouteContainerProps>(function AppRouteContainer({
    Comp,
    title,
    routeProps,
}) {
    const configStore = useContext(ConfigStoreContext);

    useURLAppLauncher();

    useIsomorphicLayoutEffect(() => {
        const compName = Comp.displayName || Comp.name;
        document.title =
            title + (process.env.NODE_ENV === "development" && compName ? ` (${compName})` : "");
        ipcAsyncByMainWindow("set-title", {
            title: document.title,
        });

        // clear selection
        window.getSelection()?.removeAllRanges();
    }, []);

    return (
        <FlatThemeBodyProvider prefersColorScheme={configStore.prefersColorScheme}>
            <AppRouteErrorBoundary Comp={Comp} {...{ title, routeProps }} />
        </FlatThemeBodyProvider>
    );
});

export default AppRouteContainer;

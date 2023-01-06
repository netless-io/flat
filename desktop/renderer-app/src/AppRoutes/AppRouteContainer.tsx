import React, { useContext, useEffect } from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import { RouteComponentProps, useLocation } from "react-router-dom";
import { ipcAsyncByMainWindow } from "../utils/ipc";
import { AppRouteErrorBoundary } from "./AppRouteErrorBoundary";
import { useURLAppLauncher } from "../utils/hooks/use-url-app-launcher";
import { FlatThemeBodyProvider } from "flat-components";
import { observer } from "mobx-react-lite";
import { IPCContext } from "../components/IPCContext";
import { useLastLocation } from "react-router-last-location";
import { PreferencesStoreContext } from "@netless/flat-pages/src/components/StoreProvider";

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
    const preferencesStore = useContext(PreferencesStoreContext);
    const ipcStore = useContext(IPCContext);

    const location = useLocation();
    const lastLocation = useLastLocation();

    useURLAppLauncher();

    useEffect(() => {
        ipcStore.configure(location.pathname, lastLocation?.pathname);

        return () => {
            ipcStore.removeIPCEvent(location.pathname);
        };
    }, [ipcStore, lastLocation?.pathname, location.pathname]);

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
        <FlatThemeBodyProvider prefersColorScheme={preferencesStore.prefersColorScheme}>
            <AppRouteErrorBoundary Comp={Comp} {...{ title, routeProps }} />
        </FlatThemeBodyProvider>
    );
});

export default AppRouteContainer;

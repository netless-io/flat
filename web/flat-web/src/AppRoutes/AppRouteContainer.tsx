import loadable from "@loadable/component";
import React, { ComponentType, FC, useContext, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useIsomorphicLayoutEffect } from "react-use";
import { PageStoreContext } from "../components/StoreProvider";
import { RouteNameType } from "../route-config";
import { AppRouteErrorBoundary } from "./AppRouteErrorBoundary";

export interface AppRouteContainerProps {
    name: RouteNameType;
    Comp: () => Promise<{ default: ComponentType<any> }>;
    title: string;
    routeProps: RouteComponentProps;
}

export const AppRouteContainer: FC<AppRouteContainerProps> = ({
    name,
    Comp,
    title,
    routeProps,
}) => {
    const pageStore = useContext(PageStoreContext);

    useIsomorphicLayoutEffect(() => {
        pageStore.setName(name);
    }, [name, pageStore]);

    useEffect(() => {
        document.title = title;

        // clear selection
        window.getSelection()?.removeAllRanges();
    }, [title]);

    return <AppRouteErrorBoundary Comp={loadable(Comp)} {...{ title, routeProps }} />;
};

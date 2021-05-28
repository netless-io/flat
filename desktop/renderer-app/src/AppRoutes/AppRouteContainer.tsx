import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { ErrorPage } from "flat-components";
import { ipcAsyncByMainWindow } from "../utils/ipc";

export interface AppRouteContainerProps {
    Comp: React.ComponentType<any>;
    title: string;
    routeProps: RouteComponentProps;
}

export interface AppRouteContainerState {
    hasError: boolean;
}

export class AppRouteContainer extends React.Component<
    AppRouteContainerProps,
    AppRouteContainerState
> {
    public constructor(props: AppRouteContainerProps) {
        super(props);
        this.state = { hasError: false };
    }

    public static getDerivedStateFromError(): Partial<AppRouteContainerState> {
        return { hasError: true };
    }

    public componentDidMount(): void {
        const { Comp, title } = this.props;
        const compName = Comp.displayName || Comp.name;
        document.title =
            title + (process.env.NODE_ENV === "development" && compName ? ` (${compName})` : "");
        ipcAsyncByMainWindow("set-title", {
            title: document.title,
        });

        // clear selection
        window.getSelection()?.removeAllRanges();
    }

    public componentDidCatch(error: any, errorInfo: any): void {
        console.error(error, errorInfo);
    }

    public render(): React.ReactNode {
        if (this.state.hasError) {
            return <ErrorPage />;
        }

        const { Comp, routeProps } = this.props;

        return <Comp {...routeProps} />;
    }
}

export default AppRouteContainer;

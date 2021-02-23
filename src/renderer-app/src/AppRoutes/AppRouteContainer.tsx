import React from "react";
import { RouteComponentProps } from "react-router";
import PageError from "../PageError";
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
    constructor(props: AppRouteContainerProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): Partial<AppRouteContainerState> {
        return { hasError: true };
    }

    componentDidMount(): void {
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

    componentDidCatch(error: any, errorInfo: any): void {
        console.error(error, errorInfo);
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return <PageError />;
        }

        const { Comp, routeProps } = this.props;

        return <Comp {...routeProps} />;
    }
}

export default AppRouteContainer;

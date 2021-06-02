import React, { ComponentType } from "react";
import { RouteComponentProps } from "react-router-dom";
import loadable from "@loadable/component";
import { ErrorPage } from "flat-components";

export interface AppRouteContainerProps {
    Comp: () => Promise<{ default: ComponentType<any> }>;
    title: string;
    routeProps: RouteComponentProps;
}

export interface AppRouteContainerState {
    hasError: boolean;
}

export class AppRouteContainer extends React.PureComponent<
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
        const { title } = this.props;
        document.title = title;

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

        return React.createElement(loadable(Comp), routeProps);
    }
}

export default AppRouteContainer;

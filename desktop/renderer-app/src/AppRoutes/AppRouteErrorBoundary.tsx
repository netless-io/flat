import React, { ComponentType } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ErrorPage } from "flat-components";
import { FlatServices } from "@netless/flat-services";

export interface AppRouteErrorBoundaryProps {
    Comp: ComponentType<any>;
    title: string;
    routeProps: RouteComponentProps;
}

export interface AppRouteErrorBoundaryState {
    hasError: boolean;
}

export class AppRouteErrorBoundary extends React.PureComponent<
    AppRouteErrorBoundaryProps,
    AppRouteErrorBoundaryState
> {
    public constructor(props: AppRouteErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    public static getDerivedStateFromError(): Partial<AppRouteErrorBoundaryState> {
        return { hasError: true };
    }

    public override componentDidCatch(error: any, errorInfo: any): void {
        console.error(error, errorInfo);
        FlatServices.getInstance().shutdownAllServices();
    }

    public override render(): React.ReactNode {
        if (this.state.hasError) {
            return <ErrorPage />;
        }

        const { Comp, routeProps } = this.props;

        return React.createElement(Comp, routeProps);
    }
}

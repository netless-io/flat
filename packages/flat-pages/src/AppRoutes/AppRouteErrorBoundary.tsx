import React from "react";
import { ErrorPage } from "flat-components";
import { FlatServices } from "@netless/flat-services";

export interface AppRouteErrorBoundaryState {
    hasError: boolean;
}

export class AppRouteErrorBoundary extends React.PureComponent<{}, AppRouteErrorBoundaryState> {
    public constructor(props: {}) {
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

        return this.props.children;
    }
}

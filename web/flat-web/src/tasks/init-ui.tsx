import "flat-components/theme/index.less";

import "../theme.less";

import React from "react";
import ReactDOM from "react-dom";

import { useLanguage } from "@netless/flat-i18n";
import { AntdProvider } from "flat-components";
import { AppRoutes } from "@netless/flat-pages/src/AppRoutes";
import { StoreProvider } from "@netless/flat-pages/src/components/StoreProvider";
import { FlatServicesContextProvider } from "@netless/flat-pages/src/components/FlatServicesContext";

/** configure right after import */
import { configure } from "mobx";
configure({
    isolateGlobalState: true,
});

const App: React.FC = () => {
    const language = useLanguage();

    return (
        <AntdProvider lang={language}>
            <StoreProvider>
                <FlatServicesContextProvider>
                    <AppRoutes />
                </FlatServicesContextProvider>
            </StoreProvider>
        </AntdProvider>
    );
};

export const initUI = (): void => {
    ReactDOM.render(<App />, document.getElementById("app"));
};

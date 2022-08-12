import "flat-components/theme/index.less";
import "../theme.less";

import React from "react";
import ReactDOM from "react-dom";

import { AppRoutes } from "../AppRoutes";
import { AntdProvider } from "flat-components";
import { useLanguage } from "@netless/flat-i18n";
import { StoreProvider } from "@netless/flat-pages/src/components/StoreProvider";
import { FlatServicesContextProvider } from "@netless/flat-pages/src/components/FlatServicesContext";
import { ipcStore } from "../stores/ipc-store";
import { IPCContext } from "../components/IPCContext";

/** configure right after import */
import { configure } from "mobx";
import { windowsBtnContext } from "../components/WindowsBtnContext";
configure({
    isolateGlobalState: true,
});

const App: React.FC = () => {
    const language = useLanguage();

    return (
        <AntdProvider lang={language}>
            <StoreProvider WindowsBtnContext={windowsBtnContext}>
                <IPCContext.Provider value={ipcStore}>
                    <FlatServicesContextProvider>
                        <AppRoutes />
                    </FlatServicesContextProvider>
                </IPCContext.Provider>
            </StoreProvider>
        </AntdProvider>
    );
};

export const initUI = (): void => {
    ReactDOM.render(<App />, document.getElementById("root"));
};

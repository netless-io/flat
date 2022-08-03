import "flat-components/theme/index.less";
import "../theme.less";

import { ConfigProvider } from "antd";
import enUS from "antd/es/locale/en_US";
import zhCN from "antd/es/locale/zh_CN";

import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { I18nextProvider } from "react-i18next";
import { useUpdate } from "react-use";

import { i18n } from "../utils/i18n";
import { AppRoutes } from "../AppRoutes";
import { StoreProvider } from "@netless/flat-pages/src/components/StoreProvider";

/** configure right after import */
import { configure } from "mobx";
import { ipcStore } from "../stores/ipc-store";
import { IPCContext } from "../components/IPCContext";
configure({
    isolateGlobalState: true,
});

const App: React.FC = () => {
    const forceUpdate = useUpdate();

    const antdLocale = useMemo(
        () => (i18n.language.startsWith("zh") ? zhCN : enUS),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [i18n.language],
    );

    useEffect(() => {
        const onLangChanged = (): void => {
            forceUpdate();
        };

        i18n.on("languageChanged", onLangChanged);

        return () => {
            i18n.off("languageChanged", onLangChanged);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <I18nextProvider i18n={i18n}>
            <ConfigProvider
                autoInsertSpaceInButton={false}
                getPopupContainer={getPopupContainer}
                // let popups scrolls with container parent
                locale={antdLocale}
            >
                <StoreProvider>
                    <IPCContext.Provider value={ipcStore}>
                        <AppRoutes />
                    </IPCContext.Provider>
                </StoreProvider>
            </ConfigProvider>
        </I18nextProvider>
    );
};

function getPopupContainer(trigger?: HTMLElement): HTMLElement {
    return trigger?.parentElement || document.body;
}

export const initUI = (): void => {
    ReactDOM.render(<App />, document.getElementById("root"));
};

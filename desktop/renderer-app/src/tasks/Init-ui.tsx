import "flat-components/theme/index.less";
import "../theme.less";

import { ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";
import zhCN from "antd/lib/locale/zh_CN";

import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { I18nextProvider } from "react-i18next";
import { useUpdate } from "react-use";

import { i18n } from "../utils/i18n";
import { AppRoutes } from "../AppRoutes";
import { StoreProvider } from "../components/StoreProvider";

/** configure right after import */
import { configure } from "mobx";
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
                locale={antdLocale}
                // let popups scrolls with container parent
                getPopupContainer={getPopupContainer}
            >
                <StoreProvider>
                    <AppRoutes />
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

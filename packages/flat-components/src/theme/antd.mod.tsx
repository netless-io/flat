import React, { useMemo } from "react";

import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import enUS from "antd/es/locale/en_US";

export interface AntdProviderProps {
    lang: string;
}

export const AntdProvider: React.FC<AntdProviderProps> = ({ lang, children }) => {
    const antdLocale = useMemo(() => (lang.startsWith("zh") ? zhCN : enUS), [lang]);
    return (
        <ConfigProvider
            autoInsertSpaceInButton={false}
            getPopupContainer={getPopupContainer}
            // let popups scrolls with container parent
            locale={antdLocale}
        >
            {children}
        </ConfigProvider>
    );
};

function getPopupContainer(trigger?: HTMLElement): HTMLElement {
    return trigger?.parentElement || document.body;
}

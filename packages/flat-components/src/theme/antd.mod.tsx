import React from "react";

import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import enUS from "antd/lib/locale/en_US";

export interface AntdProviderProps {
    lang: string;
}

export const AntdProvider: React.FC<AntdProviderProps> = ({ lang, children }) => {
    return (
        <ConfigProvider
            autoInsertSpaceInButton={false}
            getPopupContainer={getPopupContainer}
            // let popups scrolls with container parent
            locale={lang.startsWith("zh") ? zhCN : enUS}
        >
            {children}
        </ConfigProvider>
    );
};

function getPopupContainer(trigger?: HTMLElement): HTMLElement {
    return trigger?.parentElement || document.body;
}

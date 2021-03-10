import React from "react";
import ReactDOM from "react-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import { AppRoutes } from "../AppRoutes";
import { StoreProvider } from "../components/StoreProvider";

import "antd/dist/antd.less";
import "../theme.less";

/** configure right after import */
import { configure } from "mobx";
configure({
    isolateGlobalState: true,
});

const initUI = (): void => {
    ReactDOM.render(
        <ConfigProvider
            locale={zhCN}
            // let popups scrolls with container parent
            getPopupContainer={trigger => trigger?.parentElement || document.body}
        >
            <StoreProvider>
                <AppRoutes />
            </StoreProvider>
        </ConfigProvider>,
        document.getElementById("root") as HTMLElement,
    );
};

export default initUI;

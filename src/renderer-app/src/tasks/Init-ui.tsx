import React from "react";
import ReactDOM from "react-dom";
import { configure } from "mobx";
import { AppRoutes } from "../AppRoutes";
import { StoreProvider } from "../components/StoreProvider";

import "antd/dist/antd.less";
import "../theme.less";

configure({
    isolateGlobalState: true,
});

const initUI = () => {
    ReactDOM.render(
        <StoreProvider>
            <AppRoutes />
        </StoreProvider>,
        document.getElementById("root") as HTMLElement,
    );
};

export default initUI;

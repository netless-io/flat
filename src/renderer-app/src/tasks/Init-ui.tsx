import React from "react";
import ReactDOM from "react-dom";
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
        <StoreProvider>
            <AppRoutes />
        </StoreProvider>,
        document.getElementById("root") as HTMLElement,
    );
};

export default initUI;

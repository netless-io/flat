import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppRoutes } from "./AppRoutes";
import "antd/dist/antd.less";

console.log(
    process.env.NETLESS_SDK_TOKEN,
    process.env.NETLESS_APP_IDENTIFIER,
    process.env.NODE_ENV,
);

ReactDOM.render(<AppRoutes />, document.getElementById("root") as HTMLElement);

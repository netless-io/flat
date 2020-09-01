import * as React from "react";
import * as ReactDOM from "react-dom";
import {AppRoutes} from "./AppRoutes";
import "antd/dist/antd.less";

ReactDOM.render(
    <AppRoutes/>,
  document.getElementById("root") as HTMLElement,
);
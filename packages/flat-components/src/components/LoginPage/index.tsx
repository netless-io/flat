import "./index.less";

import React, { useContext } from "react";

import { DarkModeContext } from "../FlatThemeProvider";
import { Cover } from "./icons/Cover";
import { CoverDark } from "./icons/CoverDark";
export * from "./LoginWithPassword";
export * from "./LoginWithCode";
export * from "./BindingPhonePanel";
export * from "./QRCodePanel";

export interface LoginPanelProps {}

export const LoginPanel: React.FC<LoginPanelProps> = ({ children }) => {
    const darkMode = useContext(DarkModeContext);
    return (
        <div className="login-panel-container">
            <div className="login-panel-cover">{darkMode ? <CoverDark /> : <Cover />}</div>
            <div className="login-panel-inner">{children}</div>
        </div>
    );
};

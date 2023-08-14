import "./index.less";

import React, { useContext } from "react";

import { DarkModeContext } from "../FlatThemeProvider";
import { Cover } from "./icons/Cover";
import { CoverDark } from "./icons/CoverDark";
import { useLanguage } from "@netless/flat-i18n";
export * from "./LoginWithPassword";
export * from "./LoginWithCode";
export * from "./BindingPhonePanel";
export * from "./RebindingPhonePanel";
export * from "./QRCodePanel";
export * from "./LoginAccount";
export * from "./LoginPassword";
export * from "./LoginSendCode";

export interface LoginPanelProps {}

export const LoginPanel: React.FC<LoginPanelProps> = ({ children }) => {
    const language = useLanguage();
    const isZh = language.startsWith("zh");
    const darkMode = useContext(DarkModeContext);

    return (
        <div className="login-panel-container">
            <div className="login-panel-cover">
                {darkMode ? <CoverDark isZh={isZh} /> : <Cover isZh={isZh} />}
            </div>
            <div className="login-panel-inner">{children}</div>
        </div>
    );
};

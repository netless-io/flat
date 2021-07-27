import coverSVG from "./icons/cover.svg";
import bgTopLeftSVG from "./icons/bg-top-left.svg";
import bgBottomRightSVG from "./icons/bg-bottom-right.svg";
import bgBottomLeftSVG from "./icons/bg-bottom-left.svg";
import "./index.less";

import React from "react";
import { LoginContent, LoginContentProps } from "./LoginContent";

export type { LoginChannelType } from "./LoginChannel";

export interface LoginPanelProps {
    onLogin: LoginContentProps["onLogin"];
    privacyURL?: string;
    serviceURL?: string;
}

export const LoginPanel: React.FC<LoginPanelProps> = (props) => {
    return (
        <div className="login-panel-container">
            <div className="login-panel-cover">
                <img src={coverSVG} />
            </div>
            <div className="login-panel-inner">
                <div className="login-panel-inner-bg-top-left">
                    <img src={bgTopLeftSVG} />
                </div>
                <div className="login-panel-inner-bg-bottom-left">
                    <img src={bgBottomLeftSVG} />
                </div>
                <div className="login-panel-inner-bg-bottom-right">
                    <img src={bgBottomRightSVG} />
                </div>
                <div className="login-panel-inner-content-container">
                    <LoginContent {...props} />
                </div>
                <span className="login-panel-inner-bottom-text">powered by Agora</span>
            </div>
        </div>
    );
};

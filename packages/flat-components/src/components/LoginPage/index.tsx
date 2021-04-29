import coverSVG from "./icons/cover.svg";
import bgTopLeftSVG from "./icons/bg-top-left.svg";
import bgBottomRightSVG from "./icons/bg-bottom-right.svg";
import bgBottomLeftSVG from "./icons/bg-bottom-left.svg";
import "./index.less";

import React from "react";
import { LoginContent, LoginContentProps } from "./LoginContent";

export type { LoginChannelType } from "./LoginChannel";

export interface LoginPageProps {
    onLogin: LoginContentProps["onLogin"];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    return (
        <div className="login-page-container">
            <div className="login-page-cover">
                <img src={coverSVG} />
            </div>
            <div className="login-page-inner">
                <div className="login-page-inner-bg-top-left">
                    <img src={bgTopLeftSVG} />
                </div>
                <div className="login-page-inner-bg-bottom-left">
                    <img src={bgBottomLeftSVG} />
                </div>
                <div className="login-page-inner-bg-bottom-right">
                    <img src={bgBottomRightSVG} />
                </div>
                <div className="login-page-inner-content-container">
                    <LoginContent onLogin={onLogin} />
                </div>
                <span className="login-page-inner-bottom-text">powered by Agora</span>
            </div>
        </div>
    );
};

import wechatSVG from "./icons/wechat.svg";
import agoraSVG from "./icons/agora.svg";
import githubSVG from "./icons/github.svg";
import googleSVG from "./icons/google.svg";
import qqSVG from "./icons/qq.svg";
import "./index.less";

import React from "react";

export type LoginButtonProviderType = "wechat" | "github" | "agora" | "google" | "qq";

export interface LoginButtonProps {
    provider: LoginButtonProviderType;
    text?: string;
    onClick: (provider: LoginButtonProviderType) => void;
}

const svgDict: Record<LoginButtonProviderType, string> = {
    wechat: wechatSVG,
    agora: agoraSVG,
    github: githubSVG,
    google: googleSVG,
    qq: qqSVG,
};

export const LoginButton: React.FC<LoginButtonProps> = ({ provider, text, onClick }) => {
    return (
        <div className="login-button-wrapper">
            <button
                className={`login-button login-button-${provider}`}
                onClick={() => onClick(provider)}
            >
                <img alt={provider} src={svgDict[provider]} />
            </button>
            <span className="login-button-text">{text || provider}</span>
        </div>
    );
};

import { Button } from "antd";
import React from "react";
import wechatSVG from "./icons/wechat.svg";
import agoraSVG from "./icons/agora.svg";
import githubSVG from "./icons/github.svg";
import googleSVG from "./icons/google.svg";
import "./index.less";

export type LoginButtonProviderType = "wechat" | "github" | "agora" | "google";

export type LoginButtonProps = {
    provider: LoginButtonProviderType;
    onLogin: (type: LoginButtonProviderType) => void;
    text: string;
};

const svgDict: Record<LoginButtonProviderType, string> = {
    wechat: wechatSVG,
    agora: agoraSVG,
    github: githubSVG,
    google: googleSVG,
};

export const LoginButton: React.FC<LoginButtonProps> = ({ provider, onLogin, text }) => {
    return (
        <Button
            className={`login-channel-lg login-channel-${provider}`}
            onClick={() => onLogin(provider)}
        >
            <img src={svgDict[provider]} />
            {text}
        </Button>
    );
};

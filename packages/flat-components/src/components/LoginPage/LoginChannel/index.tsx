import wechatSVG from "./icons/wechat.svg";
import githubSVG from "./icons/github.svg";
import "./index.less";

import React from "react";
import { Button } from "antd";

export type LoginChannelType = "wechat" | "github";

export interface LoginChannelProps {
    onLogin: (loginChannel: LoginChannelType) => void;
}

export const LoginChannel: React.FC<LoginChannelProps> = ({ onLogin }) => {
    return (
        <div className="login-channel-container">
            <Button onClick={() => onLogin("wechat")} className="login-channel-wechat">
                <img src={wechatSVG} />
                微信登陆
            </Button>
            <Button onClick={() => onLogin("github")} className="login-channel-github">
                <img src={githubSVG} />
                GitHub登陆
            </Button>
        </div>
    );
};

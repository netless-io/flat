import wechatSVG from "./icons/wechat.svg";
import githubSVG from "./icons/github.svg";
import "./index.less";

import React from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

export type LoginChannelType = "wechat" | "github";

export interface LoginChannelProps {
    onLogin: (loginChannel: LoginChannelType) => void;
}

export const LoginChannel: React.FC<LoginChannelProps> = ({ onLogin }) => {
    const { t } = useTranslation();
    return (
        <div className="login-channel-container">
            <Button onClick={() => onLogin("wechat")} className="login-channel-wechat">
                <img src={wechatSVG} />
                {t("login-wechat")}
            </Button>
            <Button onClick={() => onLogin("github")} className="login-channel-github">
                <img src={githubSVG} />
                {t("login-github")}
            </Button>
        </div>
    );
};

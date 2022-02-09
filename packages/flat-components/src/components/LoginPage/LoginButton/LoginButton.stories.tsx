import { Meta, Story } from "@storybook/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { LoginButton, LoginButtonProviderType, LoginButtonProps } from "..";
import { message } from "antd";

const storyMeta: Meta = {
    title: "LoginPage/LoginButton",
    component: LoginButton,
};

export default storyMeta;

export const Overview: Story<LoginButtonProps> = () => {
    const { i18n } = useTranslation();

    const handleLogin = (type: LoginButtonProviderType): void => {
        void message.info(type);
    };

    return (
        <>
            <LoginButton provider="wechat" text={i18n.t("login-wechat")} onLogin={handleLogin} />
            <LoginButton provider="github" text={i18n.t("login-github")} onLogin={handleLogin} />
        </>
    );
};

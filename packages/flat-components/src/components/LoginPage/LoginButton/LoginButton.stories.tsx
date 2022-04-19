import { Meta, Story } from "@storybook/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { LoginButton, LoginButtonProviderType, LoginButtonProps } from ".";
import { message } from "antd";

const storyMeta: Meta = {
    title: "LoginPage/LoginButton",
    component: LoginButton,
};

export default storyMeta;

export const Overview: Story<LoginButtonProps> = ({ provider }) => {
    const { i18n } = useTranslation();

    const handleLogin = (type: LoginButtonProviderType): void => {
        void message.info(type);
    };

    return (
        <LoginButton provider={provider} text={i18n.t(`login-${provider}`)} onClick={handleLogin} />
    );
};

Overview.args = {
    provider: "wechat",
};

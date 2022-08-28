import { Meta, Story } from "@storybook/react";
import React from "react";
import { useTranslate } from "@netless/flat-i18n";
import { LoginButton, LoginButtonProviderType, LoginButtonProps } from ".";
import { message } from "antd";

const storyMeta: Meta = {
    title: "LoginPage/LoginButton",
    component: LoginButton,
};

export default storyMeta;

export const Overview: Story<LoginButtonProps> = ({ provider }) => {
    const t = useTranslate();

    const handleLogin = (type: LoginButtonProviderType): void => {
        void message.info(type);
    };

    return <LoginButton provider={provider} text={t(`login-${provider}`)} onClick={handleLogin} />;
};

Overview.args = {
    provider: "wechat",
};

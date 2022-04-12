import { Meta, Story } from "@storybook/react";
import React from "react";
import { message } from "antd";
import { LoginButtonProviderType } from "../LoginButton";
import { LoginButtons, LoginButtonsProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginButtons",
    component: LoginButtons,
};

export default storyMeta;

export const Overview: Story<LoginButtonsProps> = ({ buttons }) => {
    const handleLogin = (type: LoginButtonProviderType): void => {
        void message.info(type);
    };

    return <LoginButtons buttons={buttons} onClick={handleLogin} />;
};

Overview.args = {
    buttons: [
        { provider: "github", text: "GitHub" },
        { provider: "google", text: "Google" },
    ],
};

import { Meta, Story } from "@storybook/react";
import { message } from "antd";
import React from "react";
import { LoginWithCode, LoginWithCodeProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginWithCode",
    component: LoginWithCode,
};

export default storyMeta;

export const Overview: Story<LoginWithCodeProps> = props => {
    return <LoginWithCode {...props} />;
};

Overview.args = {
    onClickButton: provider => {
        message.info("login with " + provider);
    },
    sendVerificationCode: (country, phone) => {
        message.info("send verification code with " + country + " " + phone);
        return new Promise(resolve => setTimeout(() => resolve(phone === "123456"), 1000));
    },
    loginOrRegister: (country, phone, code) => {
        message.info("login with " + country + " " + phone + " " + code);
        return new Promise(resolve => setTimeout(() => resolve(false), 1000));
    },
    loginWithPassword: () => {
        message.info("login with password");
    },
};

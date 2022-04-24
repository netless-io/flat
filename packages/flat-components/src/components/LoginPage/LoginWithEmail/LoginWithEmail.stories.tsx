import { Meta, Story } from "@storybook/react";
import { message } from "antd";
import React from "react";
import { LoginWithEmail, LoginWithEmailProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginWithEmail",
    component: LoginWithEmail,
};

export default storyMeta;

export const Overview: Story<LoginWithEmailProps> = props => {
    return <LoginWithEmail {...props} />;
};

Overview.args = {
    sendVerificationCode: (email: string) => {
        console.log("sendVerificationCode", email);
        return new Promise(resolve => setTimeout(() => resolve(email === "a@a"), 1000));
    },
    verifyEmail: (email: string, code: string) => {
        console.log("verifyEmail", email, code);
        return new Promise(resolve => setTimeout(() => resolve(code === "123456"), 1000));
    },
    resetPassword: (email: string, code: string, password: string) => {
        console.log("resetPassword", email, code, password);
        return new Promise(resolve => setTimeout(() => resolve(password === "123456"), 1000));
    },
    login: (email: string, password: string) => {
        message.info("login " + email + " " + password);
        return new Promise(resolve => setTimeout(() => resolve(password === "123456"), 1000));
    },
    register: (email: string, password: string) => {
        message.info("register " + email + " " + password);
        return new Promise(resolve => setTimeout(() => resolve(password === "123456"), 1000));
    },
    onClickButton: (provider: string) => {
        message.info("login with " + provider);
    },
    bindingPhone: (country, phone, code) => {
        message.info("bindingPhone " + country + " " + phone + " " + code);
        return new Promise(resolve => setTimeout(() => resolve(code === "123456"), 1000));
    },
    sendBindingPhoneCode: (country, phone) => {
        message.info("sendVerificationCode " + country + " " + phone);
        return new Promise(resolve => setTimeout(() => resolve(phone === "123456"), 1000));
    },
};

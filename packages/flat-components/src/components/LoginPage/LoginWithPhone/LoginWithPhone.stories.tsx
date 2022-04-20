import { Meta, Story } from "@storybook/react";
import { message } from "antd";
import React from "react";
import { LoginWithPhone, LoginWithPhoneProps } from ".";
import qrcodeSVG from "./icons/qrcode.svg";

const storyMeta: Meta = {
    title: "LoginPage/LoginWithPhone",
    component: LoginWithPhone,
};

export default storyMeta;

export const Overview: Story<LoginWithPhoneProps> = props => {
    return <LoginWithPhone {...props} />;
};

Overview.args = {
    onClickButton: provider => {
        message.info("login with " + provider);
    },
    sendVerificationCode: (country, phone) => {
        message.info("sendVerificationCode " + country + " " + phone);
        return new Promise(resolve => setTimeout(() => resolve(phone === "123456"), 1000));
    },
    loginOrRegister: (country, phone, code) => {
        message.info("login " + country + " " + phone + " " + code);
        return new Promise(resolve => setTimeout(() => resolve(code === "123456"), 1000));
    },
    renderQRCode: () => <img alt="qrcode" src={qrcodeSVG} />,
    bindingPhone: (country, phone, code) => {
        message.info("bindingPhone " + country + " " + phone + " " + code);
        return new Promise(resolve => setTimeout(() => resolve(code === "123456"), 1000));
    },
    sendBindingPhoneCode: (country, phone) => {
        message.info("sendVerificationCode " + country + " " + phone);
        return new Promise(resolve => setTimeout(() => resolve(phone === "123456"), 1000));
    },
};

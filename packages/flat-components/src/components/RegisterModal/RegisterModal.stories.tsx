import { Meta, Story } from "@storybook/react";
import { message } from "antd";
import React from "react";
import { RegisterModal, RegisterProps } from ".";
import { PasswordLoginType } from "../LoginPage";

const storyMeta: Meta = {
    title: "RegisterModal/RegisterModal",
    component: RegisterModal,
};

export default storyMeta;

export const Overview: Story<RegisterProps> = props => {
    return <RegisterModal {...props} />;
};

Overview.args = {
    onClickButton: (provider: string) => {
        message.info("login with " + provider);
    },
    register: (type: PasswordLoginType, { key }, code, password: string) => {
        message.info(
            "register. current type: " +
                type +
                ". value is: " +
                key +
                ". code is: " +
                code +
                ". password is: " +
                password,
        );
        return new Promise(resolve => setTimeout(() => resolve(password === "123456"), 1000));
    },
    sendVerificationCode: (type: PasswordLoginType, key: string) => {
        message.info("send code. current type: " + type + ". value is: " + key);
        return new Promise(resolve => setTimeout(() => resolve(true), 1000));
    },
    backToLogin: () => {
        message.info("back to login");
    },
};

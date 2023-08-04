import { Meta, Story } from "@storybook/react";
import { message } from "antd";
import React from "react";
import { BindingPhonePanelProps, BindingPhonePanel } from ".";

const storyMeta: Meta = {
    title: "LoginPage/BindingPhonePanel",
    component: BindingPhonePanel,
};

export default storyMeta;

export const Overview: Story<BindingPhonePanelProps> = props => {
    return <BindingPhonePanel {...props} />;
};

Overview.args = {
    cancelBindingPhone: () => {
        message.info("back to previous step");
    },
    bindingPhone: (countryCode: string, phone: string, code: string) => {
        message.info("bind phone with " + countryCode + " " + phone + " " + code);
        return new Promise(resolve => setTimeout(() => resolve(false), 1000));
    },
    sendBindingPhoneCode: (countryCode: string, phone: string) => {
        message.info("send verification code with " + countryCode + " " + phone);
        return new Promise(resolve => setTimeout(() => resolve(false), 1000));
    },
};

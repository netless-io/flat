import { Meta, Story } from "@storybook/react";
import { message } from "antd";
import React from "react";
import { RebindingPhonePanelProps, RebindingPhonePanel } from ".";

const storyMeta: Meta = {
    title: "LoginPage/RebindingPhonePanel",
    component: RebindingPhonePanel,
};

export default storyMeta;

export const Overview: Story<RebindingPhonePanelProps> = props => {
    return <RebindingPhonePanel {...props} />;
};

Overview.args = {
    cancelRebindingPhone: () => {
        message.info("back to previous step");
    },
    rebindingPhone: (countryCode: string, phone: string, code: string) => {
        message.info("merge phone with " + countryCode + " " + phone + " " + code);
        return new Promise(resolve => setTimeout(() => resolve(false), 1000));
    },
    sendRebindingPhoneCode: (countryCode: string, phone: string) => {
        message.info("send verification code with " + countryCode + " " + phone);
        return new Promise(resolve => setTimeout(() => resolve(false), 1000));
    },
};

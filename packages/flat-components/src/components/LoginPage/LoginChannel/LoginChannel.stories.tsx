import { Meta, Story } from "@storybook/react";
import React from "react";
import { LoginChannel, LoginChannelProps } from "../LoginChannel";

const storyMeta: Meta = {
    title: "LoginPage/LoginChannel",
    component: LoginChannel,
};

export default storyMeta;

export const Overview: Story<LoginChannelProps> = args => (
    <div className="vh-75">
        <LoginChannel {...args} />
    </div>
);
Overview.args = {};

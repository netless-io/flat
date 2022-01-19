import React from "react";
import { Meta, Story } from "@storybook/react";
import { LoginContent, LoginContentProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginContent",
    component: LoginContent,
};

export default storyMeta;

export const Overview: Story<LoginContentProps> = args => (
    <div className="vh-75">
        <LoginContent {...args} />
    </div>
);

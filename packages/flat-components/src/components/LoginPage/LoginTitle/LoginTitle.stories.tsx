import { Meta, Story } from "@storybook/react";
import React from "react";
import { LoginTitle, LoginTitleProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginTitle",
    component: LoginTitle,
};

export default storyMeta;

export const Overview: Story<LoginTitleProps> = props => <LoginTitle {...props} />;

import { Meta, Story } from "@storybook/react";
import React from "react";
import { LoginTitle } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginTitle",
    component: LoginTitle,
};

export default storyMeta;

export const Overview: Story = () => <LoginTitle />;

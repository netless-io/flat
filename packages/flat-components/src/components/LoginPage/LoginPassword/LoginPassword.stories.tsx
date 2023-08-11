import { Meta, Story } from "@storybook/react";
import { Form } from "antd";
import React from "react";
import { useForm } from "antd/es/form/Form";

import { LoginPassword, LoginPasswordProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginPassword",
    component: LoginPassword,
};

export default storyMeta;

interface LoginFormValues {
    password: string;
}

export const Overview: Story<LoginPasswordProps> = props => {
    const [form] = useForm<LoginFormValues>();

    return (
        <Form form={form} name="loginPassword">
            <Form.Item name="password">
                <LoginPassword {...props} />
            </Form.Item>
        </Form>
    );
};

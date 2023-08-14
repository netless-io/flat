import { Meta, Story } from "@storybook/react";
import { Form } from "antd";
import React from "react";
import { useForm } from "antd/es/form/Form";

import { LoginAccount, LoginAccountProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginAccount",
    component: LoginAccount,
};

export default storyMeta;

interface LoginFormValues {
    key: string;
}

export const Overview: Story<LoginAccountProps> = props => {
    const [form] = useForm<LoginFormValues>();

    return (
        <Form form={form} name="loginAccount">
            <Form.Item name="key">
                <LoginAccount
                    {...props}
                    onHistoryChange={options => {
                        form.setFieldsValue({
                            key: options.value,
                        });
                    }}
                />
            </Form.Item>
        </Form>
    );
};

Overview.args = {
    accountHistory: [
        {
            key: "12345678901",
            password: "password123",
            countryCode: "+86",
        },
        {
            key: "12345678911",
            password: "password124",
            countryCode: "+65",
        },
        {
            key: "example@mail.com",
            password: "password125",
            countryCode: null,
        },
    ],
    // This means we choose the 'both' account input
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleType: () => {},
};

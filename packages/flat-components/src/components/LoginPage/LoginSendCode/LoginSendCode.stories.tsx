import { Meta, Story } from "@storybook/react";
import { Form, message } from "antd";
import React from "react";
import { useForm } from "antd/es/form/Form";

import { LoginSendCode, LoginSendCodeProps } from ".";
import { PasswordLoginType } from "../LoginAccount";

const storyMeta: Meta = {
    title: "LoginPage/LoginSendCode",
    component: LoginSendCode,
};

export default storyMeta;

interface LoginFormValues {
    code: string;
}

export const Overview: Story<LoginSendCodeProps> = props => {
    const [form] = useForm<LoginFormValues>();

    const sendVerificationCode = (): Promise<boolean> => {
        message.info(`send code with ${props.type}`);
        return new Promise(resolve => setTimeout(() => resolve(false), 1000));
    };

    return (
        <Form form={form} name="loginSendCode">
            <Form.Item name="code">
                <LoginSendCode {...props} sendVerificationCode={sendVerificationCode} />
            </Form.Item>
        </Form>
    );
};

Overview.args = {
    isAccountValidated: true,
    type: PasswordLoginType.Phone,
};

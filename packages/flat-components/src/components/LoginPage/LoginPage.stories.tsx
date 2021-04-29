import QRCodeSVG from "./icons/qr-code.svg";

import { Meta, Story } from "@storybook/react";
import { Modal } from "antd";
import React from "react";
import { LoginChannelType, LoginPage, LoginPageProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginPage",
    component: LoginPage,
    parameters: {
        layout: "fullscreen",
        viewport: {
            viewports: {
                desktop: {
                    name: "Desktop",
                    styles: { width: "960px", height: "640px" },
                },
                web: {
                    name: "Web",
                    styles: { width: "1440px", height: "674px" },
                },
            },
            defaultViewport: "desktop",
        },
        options: {
            showPanel: false,
        },
    },
};

export default storyMeta;

const handleLogin = (loginChannel: LoginChannelType): React.ReactElement | undefined => {
    switch (loginChannel) {
        case "github": {
            Modal.info({ content: "This is Github Login" });
            return;
        }
        default:
        case "wechat": {
            return <img src={QRCodeSVG} />;
        }
    }
};

export const PlayableExample: Story<LoginPageProps> = args => (
    <div className="vh-100">
        <LoginPage {...args} />
    </div>
);
PlayableExample.args = {
    onLogin: handleLogin,
};

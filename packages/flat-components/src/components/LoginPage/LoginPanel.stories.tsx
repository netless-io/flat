import QRCodeSVG from "./icons/qr-code.svg";

import { Meta, Story } from "@storybook/react";
import { Modal } from "antd";
import React from "react";
import { LoginChannelType, LoginPanel, LoginPanelProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginPanel",
    component: LoginPanel,
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
        case "wechat": {
            return <img src={QRCodeSVG} />;
        }
        case "github": {
            Modal.info({ content: "This is Github Login" });
            return;
        }
        default: {
            return;
        }
    }
};

export const PlayableExample: Story<LoginPanelProps> = args => (
    <div className="vh-100">
        <LoginPanel {...args} />
    </div>
);
PlayableExample.args = {
    onLogin: handleLogin,
};

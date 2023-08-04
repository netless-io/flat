import { Meta, Story } from "@storybook/react";
import { message } from "antd";
import React from "react";
import { QRCodePanel, QRCodePanelProps } from ".";
import qrcodeSVG from "../icons/qrcode.svg";

const storyMeta: Meta = {
    title: "LoginPage/QRCodePanel",
    component: QRCodePanel,
};

export default storyMeta;

export const Overview: Story<QRCodePanelProps> = props => {
    return <QRCodePanel {...props} />;
};

Overview.args = {
    backToLogin: () => {
        message.info("back to login");
    },
    renderQRCode: () => <img alt="qrcode" src={qrcodeSVG} />,
};

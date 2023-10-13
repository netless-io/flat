import React from "react";
import { Meta, Story } from "@storybook/react";
import { PmiExistTip, PmiExistTipProps } from ".";

const storyMeta: Meta = {
    title: "Pmi/PmiExistTip",
    component: PmiExistTip,
};

export default storyMeta;

export const Overview: Story<PmiExistTipProps> = props => {
    return <PmiExistTip {...props} />;
};

Overview.args = {
    title: "你的专属房间号，可使用该固定号码创建房间",
};

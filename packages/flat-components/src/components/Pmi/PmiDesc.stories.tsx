import React from "react";
import { Meta, Story } from "@storybook/react";
import { PmiDesc, PmiDescProps } from ".";

const storyMeta: Meta = {
    title: "Pmi/PmiDesc",
    component: PmiDesc,
};

export default storyMeta;

export const Overview: Story<PmiDescProps> = props => {
    return <PmiDesc {...props} />;
};

Overview.args = {
    text: "使用个人房间号",
    pmi: "1234 5678 900",
};

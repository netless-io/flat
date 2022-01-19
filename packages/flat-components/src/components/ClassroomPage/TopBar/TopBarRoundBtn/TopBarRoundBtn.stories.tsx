import React from "react";
import { UserAddOutlined } from "@ant-design/icons";
import { Meta, Story } from "@storybook/react";
import faker from "faker";
import { TopBarRoundBtn, TopBarRoundBtnProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/TopBarRoundBtn",
    component: TopBarRoundBtn,
};

export default storyMeta;

export const Overview: Story<TopBarRoundBtnProps> = args => <TopBarRoundBtn {...args} />;
Overview.args = {
    dark: faker.datatype.boolean(),
    icon: <UserAddOutlined />,
    className: "pa2",
    children: "Hello, world!",
};

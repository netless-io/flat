import { Meta, Story } from "@storybook/react";
import React from "react";
import { TopBarRoundBtn, TopBarRoundBtnProps } from ".";
import faker from "faker";
import { UserAddOutlined } from "@ant-design/icons";

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

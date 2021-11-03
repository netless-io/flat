import { Meta, Story } from "@storybook/react";
import React from "react";
import { TopBarRightBtn, TopBarRightBtnProps } from ".";
import faker from "faker";
import { UserAddOutlined } from "@ant-design/icons";

const storyMeta: Meta = {
    title: "ClassroomPage/TopBarRightBtn",
    component: TopBarRightBtn,
};

export default storyMeta;

export const Overview: Story<TopBarRightBtnProps> = args => <TopBarRightBtn {...args} />;
Overview.args = {
    title: "Hello, world",
    disabled: faker.datatype.boolean(),
    icon: <UserAddOutlined />,
};

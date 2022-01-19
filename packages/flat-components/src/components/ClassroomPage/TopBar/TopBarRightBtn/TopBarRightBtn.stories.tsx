import React from "react";
import { UserAddOutlined } from "@ant-design/icons";
import { Meta, Story } from "@storybook/react";
import faker from "faker";
import { TopBarRightBtn, TopBarRightBtnProps } from ".";

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

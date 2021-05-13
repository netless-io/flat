import { Meta, Story } from "@storybook/react";
import React from "react";
import { RecordButton, RecordButtonProps } from ".";
import faker from "faker";
import { BugOutlined, UserAddOutlined } from "@ant-design/icons";

const storyMeta: Meta = {
    title: "ClassroomPage/RecordButton",
    component: RecordButton,
};

export default storyMeta;

export const Overview: Story<RecordButtonProps> = args => <RecordButton {...args} />;
Overview.args = {
    disabled: faker.random.boolean(),
    icon: <UserAddOutlined />,
    iconActive: <BugOutlined />,
    isRecording: faker.random.boolean(),
};

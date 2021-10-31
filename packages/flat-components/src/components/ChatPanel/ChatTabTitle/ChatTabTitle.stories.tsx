import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { ChatTabTitle, ChatTabTitleProps } from ".";

const storyMeta: Meta = {
    title: "ChatPanel/ChatTabTitle",
    component: ChatTabTitle,
};

export default storyMeta;

export const Overview: Story<ChatTabTitleProps> = args => <ChatTabTitle {...args} />;
Overview.args = {
    unreadCount: faker.datatype.number(20),
};
Overview.argTypes = {
    unreadCount: { control: { type: "number" } },
};

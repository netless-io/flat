import { Meta, Story } from "@storybook/react";
import React from "react";
import { ChatTypeBox, ChatTypeBoxProps } from ".";

const storyMeta: Meta = {
    title: "ChatPanel/ChatTypeBox",
    component: ChatTypeBox,
};

export default storyMeta;

export const Overview: Story<ChatTypeBoxProps> = args => <ChatTypeBox {...args} />;

import { Meta, Story } from "@storybook/react";
import Chance from "chance";
import faker from "faker";
import React from "react";
import { ChatMessage, ChatMessageProps } from ".";
import { ChatMsgType } from "../types";

const chance = new Chance();

const storyMeta: Meta = {
    title: "ChatPanel/ChatMessage",
    component: ChatMessage,
};

export default storyMeta;

export const Overview: Story<ChatMessageProps> = args => <ChatMessage {...args} />;
const userUUID = faker.datatype.uuid();
Overview.args = {
    userUUID,
    messageUser: { name: faker.name.lastName() },
    message: {
        timestamp: +faker.date.past(),
        type: ChatMsgType.ChannelMessage,
        userUUID: faker.datatype.boolean() ? userUUID : faker.datatype.uuid(),
        uuid: faker.datatype.uuid(),
        value: chance.sentence({ words: faker.datatype.number(20) }),
    },
};

import { Meta, Story } from "@storybook/react";
import Chance from "chance";
import faker from "faker";
import React from "react";
import { ChatMessage, ChatMessageProps } from ".";

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
    messageUser: {
        name: faker.name.lastName(),
        avatar: "http://placekitten.com/64/64",
    },
    message: {
        type: "room-message",
        roomUUID: faker.datatype.uuid(),
        uuid: faker.datatype.uuid(),
        timestamp: +faker.date.past(),
        text: chance.sentence({ words: faker.datatype.number(20) }),
        senderID: faker.datatype.boolean() ? userUUID : faker.datatype.uuid(),
    },
};

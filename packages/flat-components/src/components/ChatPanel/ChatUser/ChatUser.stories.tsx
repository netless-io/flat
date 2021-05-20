import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { ChatUser, ChatUserProps } from ".";
import { User } from "../../../types/user";

const storyMeta: Meta = {
    title: "ChatPanel/ChatUser",
    component: ChatUser,
};

export default storyMeta;

export const Overview: Story<ChatUserProps> = args => <ChatUser {...args} />;
const makeUser = (): User => ({
    userUUID: faker.random.uuid(),
    name: faker.name.lastName(),
    isSpeak: faker.random.boolean(),
    isRaiseHand: faker.random.boolean(),
    avatar: "http://placekitten.com/64/64",
});
Overview.args = {
    generateAvatar: () => "http://placekitten.com/64/64",
    ownerUUID: faker.random.uuid(),
    userUUID: faker.random.uuid(),
    user: makeUser(),
};

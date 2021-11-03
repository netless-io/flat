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
    userUUID: faker.datatype.uuid(),
    name: faker.name.lastName(),
    isSpeak: faker.datatype.boolean(),
    isRaiseHand: faker.datatype.boolean(),
    avatar: "http://placekitten.com/64/64",
});
Overview.args = {
    generateAvatar: () => "http://placekitten.com/64/64",
    ownerUUID: faker.datatype.uuid(),
    userUUID: faker.datatype.uuid(),
    user: makeUser(),
};

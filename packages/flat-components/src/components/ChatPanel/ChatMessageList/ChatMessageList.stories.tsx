import { Meta, Story } from "@storybook/react";
import Chance from "chance";
import faker from "faker";
import React from "react";
import { ChatMessageList, ChatMessageListProps } from ".";
import { User } from "../../../types/user";
import { ChatMsgType } from "../types";

const chance = new Chance();

const storyMeta: Meta = {
    title: "ChatPanel/ChatMessageList",
    component: ChatMessageList,
};

export default storyMeta;

export const Overview: Story<ChatMessageListProps> = args => (
    <div style={{ height: "80vh" }}>
        <ChatMessageList {...args} />
    </div>
);
const makeUser = (): User => ({
    userUUID: faker.datatype.uuid(),
    name: faker.name.lastName(),
    isSpeak: faker.datatype.boolean(),
    isRaiseHand: faker.datatype.boolean(),
    avatar: "http://placekitten.com/64/64",
});
const currentUser = makeUser();
const users = ((n: number) => {
    const users = Array(n).fill(0).map(makeUser);
    users.push(currentUser);
    return chance.shuffle(users);
})(3);
Overview.args = {
    visible: true,
    userUUID: currentUser.userUUID,
    messages: Array(20)
        .fill(0)
        .map(() => ({
            timestamp: +faker.date.past(),
            type: ChatMsgType.ChannelMessage,
            userUUID: chance.pickone(users).userUUID,
            uuid: faker.datatype.uuid(),
            value: chance.sentence({ words: faker.datatype.number(20) }),
        })),
    getUserByUUID: uuid => users.find(e => e.userUUID === uuid) || makeUser(),
};
Overview.argTypes = {
    loadMoreRows: { action: "loadMoreRows" },
};

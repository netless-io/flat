import { Meta, Story } from "@storybook/react";
import Chance from "chance";
import faker from "faker";
import React from "react";
import { ChatMessages, ChatMessagesProps } from ".";
import { User } from "../../../types/user";
import { ChatMsgType } from "../ChatMessage";

const chance = new Chance();

const storyMeta: Meta = {
    title: "ChatPanel/ChatMessages",
    component: ChatMessages,
};

export default storyMeta;

export const Overview: Story<ChatMessagesProps> = args => (
    <div style={{ height: "80vh" }}>
        <ChatMessages {...args} />
    </div>
);
const makeUser = (): User => ({
    userUUID: faker.random.uuid(),
    name: faker.name.lastName(),
    isSpeak: faker.random.boolean(),
    isRaiseHand: faker.random.boolean(),
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
            uuid: faker.random.uuid(),
            value: chance.sentence({ words: faker.random.number(20) }),
        })),
    getUserByUUID: uuid => users.find(e => e.userUUID === uuid) || makeUser(),
};
Overview.argTypes = {
    loadMoreRows: { action: "loadMoreRows" },
};

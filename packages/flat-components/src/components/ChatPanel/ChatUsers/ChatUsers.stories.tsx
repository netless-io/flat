import { Meta, Story } from "@storybook/react";
import faker from "faker";
import Chance from "chance";
import React from "react";
import { ChatUsers, ChatUsersProps } from ".";
import { User } from "../../../types/user";

const chance = new Chance();

const storyMeta: Meta = {
    title: "ChatPanel/ChatUsers",
    component: ChatUsers,
};

export default storyMeta;

export const Overview: Story<ChatUsersProps> = args => (
    <div style={{ height: "80vh" }}>
        <ChatUsers {...args} />
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
    users,
    generateAvatar: () => "http://placekitten.com/64/64",
    ownerUUID: faker.datatype.boolean() ? currentUser.userUUID : chance.pickone(users).userUUID,
    userUUID: faker.datatype.boolean() ? currentUser.userUUID : chance.pickone(users).userUUID,
};

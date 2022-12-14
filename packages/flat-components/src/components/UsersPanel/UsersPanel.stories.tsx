import React from "react";
import { Meta, Story } from "@storybook/react";
import { UsersPanel, UsersPanelProps } from "./index";
import { User } from "../../types/user";
import faker from "faker";
import Chance from "chance";

const storyMeta: Meta = {
    title: "ChatPanel/UsersPanel",
    component: UsersPanel,
};

export default storyMeta;

const chance = new Chance();
const makeUser = (): User => ({
    userUUID: faker.datatype.uuid(),
    name: faker.name.lastName(),
    isSpeak: faker.datatype.boolean(),
    wbOperate: faker.datatype.boolean(),
    isRaiseHand: faker.datatype.boolean(),
    avatar: "http://placekitten.com/64/64",
});
const currentUser = makeUser();
const users = (() => {
    const users = Array(20).fill(0).map(makeUser);
    users.push(currentUser);
    return chance.shuffle(users);
})();

export const Overview: Story<UsersPanelProps> = args => (
    <div style={{ width: "80vw", height: "400px", overflow: "hidden", border: "1px solid green" }}>
        <UsersPanel {...args} />
    </div>
);
const isCreator = chance.bool();
Overview.args = {
    ownerUUID: isCreator ? currentUser.userUUID : chance.pickone(users).userUUID,
    userUUID: currentUser.userUUID,
    users,
    getDeviceState: () => ({
        camera: faker.datatype.boolean(),
        mic: faker.datatype.boolean(),
    }),
    getVolumeLevel: () => faker.datatype.number({ min: 0, max: 1, precision: 0.01 }),
};

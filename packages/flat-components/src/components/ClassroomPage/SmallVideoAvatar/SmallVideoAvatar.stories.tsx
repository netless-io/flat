import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { SmallVideoAvatar, SmallVideoAvatarProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/SmallVideoAvatar",
    component: SmallVideoAvatar,
};

export default storyMeta;

export const Overview: Story<SmallVideoAvatarProps> = args => <SmallVideoAvatar {...args} />;
Overview.args = {
    userUUID: "",
    isCreator: faker.random.boolean(),
    children: null,
    avatarUser: {
        avatar: "http://placekitten.com/64/64",
        mic: faker.random.boolean(),
        camera: false,
        name: faker.name.lastName(20),
        userUUID: "",
    },
    generateAvatar: () => "http://placekitten.com/64/64",
};
Overview.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

export const LongUserName: Story<SmallVideoAvatarProps> = args => <SmallVideoAvatar {...args} />;
LongUserName.args = {
    userUUID: "",
    isCreator: faker.random.boolean(),
    children: null,
    avatarUser: {
        avatar: "http://placekitten.com/64/64",
        mic: faker.random.boolean(),
        camera: false,
        name: faker.random.words(20),
        userUUID: "",
    },
};
LongUserName.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

export const Placeholder: Story<SmallVideoAvatarProps> = args => <SmallVideoAvatar {...args} />;
Placeholder.args = {
    userUUID: "",
    isCreator: faker.random.boolean(),
    children: null,
    avatarUser: undefined,
};
Placeholder.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

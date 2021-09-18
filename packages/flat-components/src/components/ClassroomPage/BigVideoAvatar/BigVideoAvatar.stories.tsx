import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { BigVideoAvatar, BigVideoAvatarProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/BigVideoAvatar",
    component: BigVideoAvatar,
};

export default storyMeta;

export const Overview: Story<BigVideoAvatarProps> = args => <BigVideoAvatar {...args} />;
Overview.args = {
    userUUID: "",
    isCreator: faker.random.boolean(),
    mini: false,
    children: null,
    avatarUser: {
        avatar: "http://placekitten.com/64/64",
        mic: faker.random.boolean(),
        camera: false,
        name: faker.name.lastName(20),
        userUUID: "",
    },
};
Overview.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

export const Mini: Story<BigVideoAvatarProps> = args => <BigVideoAvatar {...args} />;
Mini.args = {
    userUUID: "",
    isCreator: faker.random.boolean(),
    mini: true,
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
Mini.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

export const LongUserName: Story<BigVideoAvatarProps> = args => <BigVideoAvatar {...args} />;
LongUserName.args = {
    userUUID: "",
    isCreator: faker.random.boolean(),
    mini: false,
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

export const Placeholder: Story<BigVideoAvatarProps> = args => <BigVideoAvatar {...args} />;
Placeholder.args = {
    userUUID: "",
    isCreator: faker.random.boolean(),
    children: null,
};
Placeholder.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

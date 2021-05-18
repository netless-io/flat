import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { BigClassAvatar, BigClassAvatarProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/VideoAvatar",
    component: BigClassAvatar,
};

export default storyMeta;

export const BigClass: Story<BigClassAvatarProps> = args => <BigClassAvatar {...args} />;
BigClass.args = {
    userUUID: "",
    isCreator: faker.random.boolean(),
    small: faker.random.boolean(),
    children: null,
    avatarUser: {
        avatar: "http://placekitten.com/64/64",
        mic: faker.random.boolean(),
        camera: false,
        name: faker.name.lastName(20),
        userUUID: "",
    },
};
BigClass.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

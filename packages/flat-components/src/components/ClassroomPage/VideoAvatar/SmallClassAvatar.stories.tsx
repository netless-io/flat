import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { SmallClassAvatar, SmallClassAvatarProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/VideoAvatar",
    component: SmallClassAvatar,
};

export default storyMeta;

export const SmallClass: Story<SmallClassAvatarProps> = args => <SmallClassAvatar {...args} />;
SmallClass.args = {
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
};
SmallClass.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

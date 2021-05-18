import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { OneToOneAvatar, OneToOneAvatarProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/VideoAvatar",
    component: OneToOneAvatar,
};

export default storyMeta;

export const OneToOneClass: Story<OneToOneAvatarProps> = args => {
    return (
        <div className="flex" style={{ width: 288 }}>
            <OneToOneAvatar {...args} />
            <OneToOneAvatar {...args} />
        </div>
    );
};
OneToOneClass.args = {
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
OneToOneClass.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

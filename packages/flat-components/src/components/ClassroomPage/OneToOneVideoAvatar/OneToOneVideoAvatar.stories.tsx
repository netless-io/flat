import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { OneToOneVideoAvatar, OneToOneVideoAvatarProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/OneToOneVideoAvatar",
    component: OneToOneVideoAvatar,
};

export default storyMeta;

export const Overview: Story<OneToOneVideoAvatarProps> = args => <OneToOneVideoAvatar {...args} />;
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

export const Pair: Story<OneToOneVideoAvatarProps> = args => {
    return (
        <div className="flex" style={{ width: 288 }}>
            <OneToOneVideoAvatar {...args} />
            <OneToOneVideoAvatar {...args} />
        </div>
    );
};
Pair.args = {
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
Pair.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

export const LongUserName: Story<OneToOneVideoAvatarProps> = args => (
    <OneToOneVideoAvatar {...args} />
);
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

export const Placeholder: Story<OneToOneVideoAvatarProps> = args => (
    <OneToOneVideoAvatar {...args} />
);
Placeholder.args = {
    userUUID: "",
    isCreator: faker.random.boolean(),
    children: null,
    avatarUser: undefined,
};
Placeholder.argTypes = {
    updateDeviceState: { action: "updateDeviceState" },
};

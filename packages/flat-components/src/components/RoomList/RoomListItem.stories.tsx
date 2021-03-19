import { Meta, Story } from "@storybook/react";
import { Button } from "antd";
import faker from "faker";
import React from "react";
import { RoomListItem, RoomListItemProps } from ".";

const storyMeta: Meta = {
    title: "HomePage/RoomListItem",
    component: RoomListItem,
};

export default storyMeta;

export const Overview: Story<RoomListItemProps> = args => <RoomListItem {...args} />;
Overview.args = {
    title: faker.random.words(4),
    beginTime: faker.date.past(),
    endTime: faker.date.future(),
    status: "idle",
    extra: <Button type="primary">Enter</Button>,
    isPeriodic: faker.random.boolean(),
};
Overview.argTypes = {
    beginTime: { control: "date" },
    endTime: { control: "date" },
    extra: { control: false },
};

export const LongRoomName: Story<RoomListItemProps> = args => <RoomListItem {...args} />;
LongRoomName.args = {
    title: faker.random.words(20),
    beginTime: faker.date.past(),
    endTime: faker.date.future(),
    status: "idle",
    extra: <Button type="primary">Enter</Button>,
    isPeriodic: faker.random.boolean(),
};
LongRoomName.argTypes = {
    title: { table: { category: "Showcase" } },
};

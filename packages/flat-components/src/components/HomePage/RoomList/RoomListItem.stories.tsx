import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { RoomListItem, RoomListItemProps } from ".";

const storyMeta: Meta = {
    title: "HomePage/RoomListItem",
    component: RoomListItem,
};

export default storyMeta;

/**
 * TODO: we forget set i18n in current file!!!
 */

export const Overview: Story<RoomListItemProps<string>> = args => <RoomListItem {...args} />;
Overview.args = {
    title: faker.random.words(4),
    beginTime: faker.date.past(),
    endTime: faker.date.future(),
    status: "upcoming",
    buttons: [
        [
            { key: "modify", text: "修改" },
            { key: "cancel", text: "取消" },
        ],
        { key: "enter", text: "进入" },
    ],
    isPeriodic: faker.datatype.boolean(),
};
Overview.argTypes = {
    beginTime: { control: "date" },
    endTime: { control: "date" },
    extra: { control: false },
};

export const LongRoomName: Story<RoomListItemProps<string>> = args => <RoomListItem {...args} />;
LongRoomName.args = {
    title: faker.random.words(20),
    beginTime: faker.date.past(),
    endTime: faker.date.future(),
    status: "upcoming",
    buttons: [
        [
            { key: "modify", text: "修改" },
            { key: "cancel", text: "取消" },
        ],
        { key: "enter", text: "进入" },
    ],
    isPeriodic: faker.datatype.boolean(),
};
LongRoomName.argTypes = {
    title: { table: { category: "Showcase" } },
};

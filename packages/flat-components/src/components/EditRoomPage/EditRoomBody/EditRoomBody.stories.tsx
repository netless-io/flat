import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { EditRoomBody, EditRoomBodyProps, Region } from ".";
import { RoomType } from "../../../types/room";

const storyMeta: Meta = {
    title: "EditRoomPage/EditRoomBody",
    component: EditRoomBody,
};

export default storyMeta;

export const Overview: Story<EditRoomBodyProps> = args => <EditRoomBody {...args} />;
Overview.args = {
    type: "schedule",
    initialValues: {
        isPeriodic: false,
        type: RoomType.BigClass,
        region: Region.CN_HZ,
        beginTime: faker.date.future(),
        endTime: faker.date.future(),
        title: faker.random.words(),
    },
};
Overview.argTypes = {
    type: { control: { type: "select" } },
};

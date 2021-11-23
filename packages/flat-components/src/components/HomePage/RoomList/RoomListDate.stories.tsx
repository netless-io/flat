import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { RoomListDate, RoomListDateProps } from ".";

const storyMeta: Meta = {
    title: "HomePage/RoomListDate",
    component: RoomListDate,
};

export default storyMeta;

export const Overview: Story<RoomListDateProps> = args => <RoomListDate {...args} />;
Overview.args = {
    date: faker.date.future(),
};
Overview.argTypes = {
    date: {
        control: false,
    },
};

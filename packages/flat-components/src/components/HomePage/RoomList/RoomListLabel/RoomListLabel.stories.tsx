import { Meta, Story } from "@storybook/react";
import React from "react";
import faker from "faker";
import { RoomListLabel } from ".";

const storyMeta: Meta = {
    title: "HomePage/RoomListLabel",
    component: RoomListLabel,
};

export default storyMeta;

export const Overview: Story = args => (
    <>
        {([undefined, "success", "warning", "primary"] as const).map(type => (
            <RoomListLabel {...args} className="mr3" type={type}>
                {faker.random.word()}
            </RoomListLabel>
        ))}
    </>
);

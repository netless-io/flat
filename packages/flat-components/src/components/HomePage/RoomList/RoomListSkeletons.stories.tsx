import { Meta, Story } from "@storybook/react";
import React from "react";
import { RoomListSkeletons } from ".";

const storyMeta: Meta = {
    title: "HomePage/RoomListSkeletons",
    component: RoomListSkeletons,
};

export default storyMeta;

export const Overview: Story = args => <RoomListSkeletons {...args} />;

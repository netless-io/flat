import { Meta, Story } from "@storybook/react";
import React from "react";
import { RoomInfo, RoomInfoProps } from ".";
import { RoomStatus } from "../../../types/room";

const storyMeta: Meta = {
    title: "ClassroomPage/RoomInfo",
    component: RoomInfo,
};

export default storyMeta;

export const Overview: Story<RoomInfoProps> = args => <RoomInfo {...args} />;
Overview.args = {
    roomStatus: RoomStatus.Started,
};

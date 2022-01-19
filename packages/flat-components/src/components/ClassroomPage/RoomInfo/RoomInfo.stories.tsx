import React from "react";
import { Meta, Story } from "@storybook/react";
import { RoomStatus } from "../../../types/room";
import { RoomInfo, RoomInfoProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/RoomInfo",
    component: RoomInfo,
};

export default storyMeta;

export const Overview: Story<RoomInfoProps> = args => <RoomInfo {...args} />;
Overview.args = {
    roomStatus: RoomStatus.Started,
};

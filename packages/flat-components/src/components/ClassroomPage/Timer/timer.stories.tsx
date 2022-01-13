import { Meta, Story } from "@storybook/react";
import React from "react";
import { RoomStatus } from "../../../types/room";
import { Timer, TimerProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/Timer",
    component: Timer,
};

export default storyMeta;

export const Overview: Story<TimerProps> = args => {
    return <Timer {...args} />;
};

Overview.args = {
    roomStatus: RoomStatus.Paused,
    beginTime: Date.now(),
};

import { Meta, Story } from "@storybook/react";
import React from "react";
import { RoomStatus } from "../../../types/room";
import { Countdown, CountdownProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/Countdown",
    component: Countdown,
};

export default storyMeta;

export const Overview: Story<CountdownProps> = args => {
    return <Countdown {...args} />;
};

Overview.args = {
    roomStatus: RoomStatus.Paused,
    beginTime: Date.now(),
};

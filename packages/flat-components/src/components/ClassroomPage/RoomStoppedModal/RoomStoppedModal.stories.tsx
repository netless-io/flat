import React from "react";
import { Meta, Story } from "@storybook/react";
import { RoomStatus } from "../../../types/room";
import { RoomStoppedModal, RoomStoppedModalProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/RoomStoppedModal",
    component: RoomStoppedModal,
};

export default storyMeta;

export const Overview: Story<RoomStoppedModalProps> = args => <RoomStoppedModal {...args} />;
Overview.args = {
    roomStatus: RoomStatus.Stopped,
    isCreator: false,
};

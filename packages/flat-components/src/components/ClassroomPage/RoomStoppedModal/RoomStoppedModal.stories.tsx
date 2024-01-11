import { Meta, Story } from "@storybook/react";
import React from "react";
import { RoomStoppedModal, RoomStoppedModalProps } from ".";
import { RoomStatus } from "../../../types/room";

const storyMeta: Meta = {
    title: "ClassroomPage/RoomStoppedModal",
    component: RoomStoppedModal,
};

export default storyMeta;

export const Overview: Story<RoomStoppedModalProps> = args => <RoomStoppedModal {...args} />;
Overview.args = {
    roomStatus: RoomStatus.Stopped,
    isExitConfirmModalVisible: false,
};

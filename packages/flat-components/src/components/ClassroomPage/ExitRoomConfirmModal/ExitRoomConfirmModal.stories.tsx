import { Meta, Story } from "@storybook/react";
import React from "react";
import { CloseRoomConfirmModal, CloseRoomConfirmModalProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/CloseRoomConfirmModal",
    component: CloseRoomConfirmModal,
};

export default storyMeta;

export const Overview: Story<CloseRoomConfirmModalProps> = args => (
    <CloseRoomConfirmModal {...args} />
);
Overview.args = {
    visible: true,
    hangLoading: false,
    stopLoading: false,
};

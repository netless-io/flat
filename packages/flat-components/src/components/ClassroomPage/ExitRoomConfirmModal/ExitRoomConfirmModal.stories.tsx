import React from "react";
import { Meta, Story } from "@storybook/react";
import {
    CloseRoomConfirmModal,
    CloseRoomConfirmModalProps,
    ExitRoomConfirmModal,
    ExitRoomConfirmModalProps,
    StopClassConfirmModal,
    StopClassConfirmModalProps,
} from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/CloseRoomConfirmModal",
    component: CloseRoomConfirmModal,
    parameters: {
        docs: { page: null },
    },
};

export default storyMeta;

export const CloseRoomConfirm: Story<CloseRoomConfirmModalProps> = args => (
    <CloseRoomConfirmModal {...args} />
);
CloseRoomConfirm.args = {
    visible: true,
    hangLoading: false,
    stopLoading: false,
};

export const StopClassConfirm: Story<StopClassConfirmModalProps> = args => (
    <StopClassConfirmModal {...args} />
);
StopClassConfirm.args = {
    visible: true,
};

export const ExitRoomConfirm: Story<ExitRoomConfirmModalProps> = args => (
    <ExitRoomConfirmModal {...args} />
);
ExitRoomConfirm.args = {
    visible: true,
};

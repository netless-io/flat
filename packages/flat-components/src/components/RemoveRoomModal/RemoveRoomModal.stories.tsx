import React from "react";
import { Meta, Story } from "@storybook/react";
import { RemoveRoomModal, RemoveRoomModalProps } from ".";

const storyMeta: Meta = {
    title: "Components/RemoveRoomModal",
    component: RemoveRoomModal,
};

export default storyMeta;

export const Overview: Story<RemoveRoomModalProps> = args => (
    <div className="vh-75 mw8-ns">
        <RemoveRoomModal {...args} />
    </div>
);
Overview.args = {
    cancelModalVisible: true,
    isCreator: true,
    periodicUUID: "periodicUUID",
    isPeriodicDetailsPage: true,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancelRoom: () => {},
};

import React from "react";
import { Meta, Story } from "@storybook/react";
import { RemoveHistoryRoomModal, RemoveHistoryRoomModalProps } from ".";

const storyMeta: Meta = {
    title: "Components/RemoveHistoryRoomModal",
    component: RemoveHistoryRoomModal,
};

export default storyMeta;

export const Overview: Story<RemoveHistoryRoomModalProps> = args => (
    <div className="vh-75 mw8-ns">
        <RemoveHistoryRoomModal {...args} />
    </div>
);
Overview.args = {
    visible: true,
};

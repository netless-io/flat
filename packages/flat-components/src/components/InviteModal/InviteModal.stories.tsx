import React from "react";
import { Meta, Story } from "@storybook/react";
import { InviteModal, InviteModalProps } from ".";
import { RoomStatus, RoomType } from "../../types/room";
import { message } from "antd";

const storyMeta: Meta = {
    title: "Components/InviteModal",
    component: InviteModal,
};

export default storyMeta;

export const Overview: Story<InviteModalProps> = args => (
    <div className="vh-75 mw8-ns">
        <InviteModal {...args} />
    </div>
);
Overview.args = {
    visible: true,
    room: {
        roomUUID: "roomUUID",
        ownerUUID: "ownerUUID",
        title: "RoomDetailTitle",
        roomType: RoomType.BigClass,
        roomStatus: RoomStatus.Started,
        beginTime: 1619771930756,
        endTime: 1619775530756,
    },
    userName: "Flat",
    onCopy: () => {
        message.success("复制成功");
    },
    onCancel: () => {},
};

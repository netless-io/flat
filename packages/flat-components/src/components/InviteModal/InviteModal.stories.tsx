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

/**
 * TODO: we forget set i18n in current file!!!
 */

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
    baseUrl: "https://flat-web.whiteboard.agora.io/join/34513345f235",
    userName: "Flat",
    onCopy: () => {
        void message.success("复制成功");
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel: () => {},
};

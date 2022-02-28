import React from "react";
import { Meta, Story } from "@storybook/react";
import { RoomDetailHeader, RoomDetailBodyProps } from ".";
import { RoomStatus, RoomType } from "../../../types/room";

const storyMeta: Meta = {
    title: "RoomDetailPage/RoomDetailHeader",
    component: RoomDetailHeader,
};

export default storyMeta;

export const Overview: Story<RoomDetailBodyProps> = args => (
    <div className="vh-75 mw8-ns">
        <RoomDetailHeader {...args} />
    </div>
);
Overview.args = {
    roomInfo: {
        roomUUID: "roomUUID",
        ownerUUID: "ownerUUID",
        title: "RoomDetailTitle",
        roomType: RoomType.BigClass,
        roomStatus: RoomStatus.Started,
        beginTime: 1619771930756,
        endTime: 1619775530756,
        count: 7,
    },
    showRoomCountVisible: true,
};

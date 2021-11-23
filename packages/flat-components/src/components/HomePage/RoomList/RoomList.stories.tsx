import { Meta, Story } from "@storybook/react";
import faker from "faker";
import { Chance } from "chance";
import React from "react";
import { RoomList, RoomListDate, RoomListItem, RoomListProps } from ".";

const chance = new Chance();

const storyMeta: Meta = {
    title: "HomePage/RoomList",
    component: RoomList,
};

/**
 * TODO: we forget set i18n in current file!!!
 */

export default storyMeta;

export const Overview: Story<RoomListProps<string>> = args => (
    <RoomList {...args}>
        <RoomListDate date={chance.date()} />
        {Array(20)
            .fill(0)
            .map(() => (
                <RoomListItem
                    title={faker.random.words()}
                    status={chance.pickone(["upcoming", "running", "stopped"])}
                    isPeriodic={chance.bool()}
                    beginTime={chance.date()}
                />
            ))}
    </RoomList>
);
Overview.args = {
    title: "房间列表",
    filters: [
        {
            title: "全部",
            key: "all",
        },
        {
            title: "今天",
            key: "today",
        },
        {
            title: "周期",
            key: "periodic",
        },
    ],
    activeTab: "all",
    style: {
        height: 400,
    },
};

import { Meta, Story } from "@storybook/react";
import faker from "faker";
import { Chance } from "chance";
import React from "react";
import { RoomList, RoomListItem, RoomListProps } from ".";
import { addHours } from "date-fns";

const chance = new Chance();

const storyMeta: Meta = {
    title: "HomePage/RoomList",
    component: RoomList,
};

/**
 * TODO: we forget set i18n in current file!!!
 */

export default storyMeta;

export const Overview: Story<RoomListProps<string>> = args => {
    const beginTime = chance.date();
    return (
        <RoomList {...args}>
            {Array(20)
                .fill(0)
                .map((_, i) => (
                    <RoomListItem
                        key={i}
                        beginTime={beginTime}
                        buttons={[
                            [
                                { key: "modify", text: "修改" },
                                { key: "cancel", text: "取消" },
                            ],
                            { key: "enter", text: "进入" },
                        ]}
                        endTime={addHours(beginTime, 1)}
                        isPeriodic={chance.bool()}
                        status={chance.pickone(["upcoming", "running", "stopped"])}
                        title={faker.random.words()}
                    />
                ))}
        </RoomList>
    );
};
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

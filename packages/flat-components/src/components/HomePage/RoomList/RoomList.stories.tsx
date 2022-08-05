import { Meta, Story } from "@storybook/react";
import faker from "faker";
import { Chance } from "chance";
import React from "react";
import { RoomList, RoomListItem, RoomListItemProps, RoomListProps } from ".";
import { addHours } from "date-fns";
import { useTranslate } from "@netless/flat-i18n";

const chance = new Chance();

const storyMeta: Meta = {
    title: "HomePage/RoomList",
    component: RoomList,
    parameters: {
        backgrounds: {
            default: "Homepage Background",
        },
        viewport: {
            defaultViewport: "mobile2",
        },
    },
};

export default storyMeta;

export const Overview: Story<
    RoomListProps<string> & Pick<RoomListItemProps<string>, "onAction">
> = args => {
    const beginTime = chance.date();
    const t = useTranslate();

    return (
        <RoomList
            {...args}
            filters={args.filters && args.filters.map(item => ({ ...item, title: t(item.title) }))}
            title={args.title && t(args.title)}
        >
            {Array(20)
                .fill(0)
                .map((_, i) => (
                    <RoomListItem
                        key={i}
                        beginTime={beginTime}
                        endTime={addHours(beginTime, 1)}
                        isPeriodic={chance.bool()}
                        menuActions={[
                            { key: "modify", text: t("modify") },
                            { key: "cancel", text: t("cancel") },
                        ]}
                        ownerAvatar="http://placekitten.com/g/100/100"
                        ownerName={faker.name.firstName()}
                        primaryAction={{ key: "enter", text: t("begin"), type: "primary" }}
                        status={chance.pickone(["upcoming", "running", "stopped"])}
                        title={faker.random.words()}
                        onAction={args.onAction}
                    />
                ))}
        </RoomList>
    );
};
Overview.args = {
    title: "room-list",
    filters: [
        {
            title: "all",
            key: "all",
        },
        {
            title: "today",
            key: "today",
        },
        {
            title: "periodic",
            key: "periodic",
        },
    ],
    activeTab: "all",
    style: {
        height: 400,
    },
};
Overview.argTypes = {
    onAction: { action: "onAction" },
};

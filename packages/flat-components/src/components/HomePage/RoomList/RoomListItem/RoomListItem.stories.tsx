import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { useTranslate } from "@netless/flat-i18n";
import { RoomListItem, RoomListItemAction, RoomListItemProps } from ".";

const storyMeta: Meta = {
    title: "HomePage/RoomListItem",
    component: RoomListItem,
    parameters: {
        backgrounds: {
            default: "White",
        },
        viewport: {
            defaultViewport: "mobile2",
        },
    },
};

export default storyMeta;

const Template: Story<RoomListItemProps<string>> = args => {
    const t = useTranslate();
    const translateAction = <T extends RoomListItemAction<string>>(action: T): T => ({
        ...action,
        text: t(action.text),
    });
    return (
        <RoomListItem
            {...args}
            menuActions={args.menuActions && args.menuActions.map(translateAction)}
            primaryAction={args.primaryAction && translateAction(args.primaryAction)}
        />
    );
};

export const Overview: Story<RoomListItemProps<string>> = Template.bind({});
Overview.args = {
    title: faker.random.words(4),
    beginTime: faker.date.past(),
    endTime: faker.date.future(),
    status: "upcoming",
    ownerName: faker.name.firstName(),
    ownerAvatar: "http://placekitten.com/g/100/100",
    menuActions: [
        { key: "modify", text: "modify" },
        { key: "cancel", text: "cancel" },
    ],
    primaryAction: { key: "enter", text: "join", type: "primary" },
    isPeriodic: true,
};
Overview.argTypes = {
    beginTime: { control: "date" },
    endTime: { control: "date" },
    extra: { control: false },
};

export const LongRoomName: Story<RoomListItemProps<string>> = Template.bind({});
LongRoomName.args = {
    title: faker.random.words(20),
    beginTime: faker.date.past(),
    endTime: faker.date.future(),
    status: "upcoming",
    ownerName: faker.name.firstName(),
    ownerAvatar: "http://placekitten.com/g/32/32",
    menuActions: [
        { key: "modify", text: "modify" },
        { key: "cancel", text: "cancel" },
    ],
    primaryAction: { key: "enter", text: "join", type: "primary" },
    isPeriodic: true,
};
LongRoomName.argTypes = {
    title: { table: { category: "Showcase" } },
};

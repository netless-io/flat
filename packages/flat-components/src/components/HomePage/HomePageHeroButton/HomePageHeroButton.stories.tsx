import React from "react";
import { Meta, Story } from "@storybook/react";
import { HomePageHeroButtons, HomePageHeroButtonsProps } from ".";

const storyMeta: Meta = {
    title: "HomePage/HomePageHeroButtons",
    component: HomePageHeroButtons,
    parameters: {
        backgrounds: {
            default: "Homepage Background",
        },
    },
};

export default storyMeta;

export const Overview: Story<HomePageHeroButtonsProps> = args => <HomePageHeroButtons {...args} />;

export const TabletScreen: Story<HomePageHeroButtonsProps> = args => (
    <HomePageHeroButtons {...args} />
);
TabletScreen.parameters = {
    viewport: {
        defaultViewport: "tablet2",
    },
};

export const SmallScreen: Story<HomePageHeroButtonsProps> = args => (
    <HomePageHeroButtons {...args} />
);
SmallScreen.parameters = {
    viewport: {
        defaultViewport: "mobile1",
    },
};

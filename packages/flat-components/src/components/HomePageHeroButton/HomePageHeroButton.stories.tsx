import { Meta, Story } from "@storybook/react";
import { MINIMAL_VIEWPORTS } from "@storybook/addon-viewport";
import React from "react";
import { HomePageHeroButtons, HomePageHeroButtonsProps } from ".";

const storyMeta: Meta = {
    title: "Components/HomePageHeroButtons",
    component: HomePageHeroButtons,
    parameters: {
        backgrounds: {
            default: "flat",
            values: [
                {
                    name: "flat",
                    value: "#F3F6F9",
                },
            ],
        },
        viewport: {
            viewports: {
                ...MINIMAL_VIEWPORTS,
                tablet2: {
                    name: "Large Tablet",
                    styles: { width: "659px", height: "1000px" },
                },
            },
        },
    },
};

export default storyMeta;

export const Overview: Story<HomePageHeroButtonsProps> = args => (
    <HomePageHeroButtons {...args} />
);

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

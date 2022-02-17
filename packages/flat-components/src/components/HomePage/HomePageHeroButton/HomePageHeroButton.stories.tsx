import { Meta, Story } from "@storybook/react";
import { Col, Row } from "antd";
import React from "react";
import { HomePageHeroButton } from ".";

const storyMeta: Meta = {
    title: "HomePage/HomePageHeroButtons",
    component: HomePageHeroButton,
    parameters: {
        backgrounds: {
            default: "Homepage Background",
        },
        viewport: {
            defaultViewport: "flatDesktop",
        },
    },
};

export default storyMeta;

interface HomePageHeroButtonsProps {
    onJoin?: () => void;
    onCreate?: () => void;
    onSchedule?: () => void;
}

export const Overview: Story<HomePageHeroButtonsProps> = args => (
    <Row gutter={16}>
        <Col span={6}>
            <HomePageHeroButton type="join" onClick={args.onJoin} />
        </Col>
        <Col span={6}>
            <HomePageHeroButton type="begin" onClick={args.onCreate} />
        </Col>
        <Col span={6}>
            <HomePageHeroButton type="schedule" onClick={args.onSchedule} />
        </Col>
    </Row>
);

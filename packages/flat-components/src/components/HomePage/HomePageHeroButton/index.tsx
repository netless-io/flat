import "./style.less";
import { SVGJoin } from "./icons/SVGJoin/";
import { SVGBegin } from "./icons/SVGBegin/";
import { SVGSchedule } from "./icons/SVGSchedule/";
import React from "react";
import { Button } from "antd";
import { useTranslate } from "@netless/flat-i18n";
import { SVGAITeacher } from "./icons/SVGAITeacher";

type HomePageHeroButtonType = "join" | "begin" | "schedule" | "aiTeacher";

const HomePageHeroButtonIcons: Record<HomePageHeroButtonType, React.FC> = {
    join: SVGJoin,
    begin: SVGBegin,
    schedule: SVGSchedule,
    aiTeacher: SVGAITeacher,
};

export interface HomePageHeroButtonProps {
    type: HomePageHeroButtonType;
    onClick?: () => void;
}

export const HomePageHeroButton: React.FC<HomePageHeroButtonProps> = ({
    type,
    onClick,
    children,
}) => {
    const t = useTranslate();
    return (
        <Button className="home-page-hero-button" onClick={onClick}>
            <span className="home-page-hero-button-icon">
                {React.createElement(HomePageHeroButtonIcons[type])}
            </span>
            <span className="home-page-hero-button-text">
                {t(`home-page-hero-button-type.${type}`)}
            </span>
            {children}
        </Button>
    );
};

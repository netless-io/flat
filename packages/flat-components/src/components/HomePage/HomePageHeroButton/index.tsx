import "./style.less";
import joinSVG from "./icons/join.svg";
import createSVG from "./icons/create.svg";
import scheduleSVG from "./icons/schedule.svg";
import React from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

type HomePageHeroButtonType = "join" | "create" | "schedule";

interface HomePageHeroButtonBaseProps {
    type: HomePageHeroButtonType;
    text: string;
    onClick?: () => void;
}

const HomePageHeroButtonIcons: Record<HomePageHeroButtonType, string> = {
    join: joinSVG,
    create: createSVG,
    schedule: scheduleSVG,
};

const HomePageHeroButtonBase: React.FC<HomePageHeroButtonBaseProps> = ({ type, text, onClick }) => {
    return (
        <Button className="home-page-hero-button" onClick={onClick}>
            <img className="icon" src={HomePageHeroButtonIcons[type]}></img>
            <span className="text">{text}</span>
        </Button>
    );
};

export interface HomePageHeroButtonProps {
    type: HomePageHeroButtonType;
    onClick?: () => void;
}

export const HomePageHeroButton: React.FC<HomePageHeroButtonProps> = ({ type, onClick }) => {
    const { t } = useTranslation();
    return (
        <HomePageHeroButtonBase
            text={t(`home-page-hero-button-type.${type}`)}
            type={type}
            onClick={onClick}
        />
    );
};

export interface HomePageHeroButtonsProps {
    onJoin?: () => void;
    onCreate?: () => void;
    onSchedule?: () => void;
}

export const HomePageHeroButtons: React.FC<HomePageHeroButtonsProps> = ({
    onJoin,
    onCreate,
    onSchedule,
}) => {
    return (
        <div className="home-page-hero-buttons">
            <HomePageHeroButton type="join" onClick={onJoin} />
            <HomePageHeroButton type="create" onClick={onCreate} />
            <HomePageHeroButton type="schedule" onClick={onSchedule} />
        </div>
    );
};

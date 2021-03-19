import "./style.less";
import React from "react";
import classNames from "classnames";
import { Button } from "antd";

type HomePageHeroButtonType = "join" | "create" | "schedule";

interface HomePageHeroButtonBaseProps {
    type: HomePageHeroButtonType;
    text: string;
    onClick?: () => void;
}

const HomePageHeroButtonBase: React.FC<HomePageHeroButtonBaseProps> = ({ type, text, onClick }) => {
    return (
        <Button className="home-page-hero-button" onClick={onClick}>
            <span className={classNames("icon", type)}></span>
            <span className="text">{text}</span>
        </Button>
    );
};

export interface HomePageHeroButtonProps {
    type: HomePageHeroButtonType;
    onClick?: () => void;
}

const HomePageHeroButtonTypeTexts: Record<HomePageHeroButtonType, string> = {
    join: "加入房间",
    create: "创建房间",
    schedule: "预定房间",
};

export const HomePageHeroButton: React.FC<HomePageHeroButtonProps> = ({ type, onClick }) => {
    return (
        <HomePageHeroButtonBase
            type={type}
            text={HomePageHeroButtonTypeTexts[type]}
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

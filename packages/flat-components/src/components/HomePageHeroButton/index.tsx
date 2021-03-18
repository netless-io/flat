import "./style.less";
import React from "react";
import classNames from "classnames";
import { Button } from "antd";

type HomePageHeroButtonType = "join" | "create" | "schedule";

interface HomePageHeroButtonBaseProps {
    type: HomePageHeroButtonType;
    longText: string;
    shortText: string;
    onClick?: () => void;
}

const HomePageHeroButtonBase: React.FC<HomePageHeroButtonBaseProps> = ({
    type,
    longText,
    shortText,
    onClick,
}) => {
    return (
        <Button
            className="home-page-hero-button"
            onClick={onClick}>
            <span className={classNames("icon", type)}></span>
            <span className="text long">{longText}</span>
            <span className="text short">{shortText}</span>
        </Button>
    );
};

export interface HomePageHeroButtonProps {
    type: HomePageHeroButtonType;
    onClick?: () => void;
}

const Presets: Record<
    HomePageHeroButtonType,
    Pick<HomePageHeroButtonBaseProps, "longText" | "shortText">
> = {
    join: {
        longText: "加入房间",
        shortText: "加入",
    },
    create: {
        longText: "创建房间",
        shortText: "创建",
    },
    schedule: {
        longText: "预定房间",
        shortText: "预定",
    },
};

export const HomePageHeroButton: React.FC<HomePageHeroButtonProps> = ({ type, onClick }) => {
    return <HomePageHeroButtonBase type={type} {...Presets[type]} onClick={onClick} />;
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

import "./style.less";

import React from "react";
import { MainPageNavAvatar, MainPageNavAvatarProps } from "../MainPageNavAvatar";

export interface MainPageTopBarMenuItem {
    key: string;
    route: string;
    icon: React.ReactNode;
}

export interface MainPageTopBarProps extends MainPageNavAvatarProps {
    topBarMenu: MainPageTopBarMenuItem[];
    onClickTopBarMenu: (menuItem: MainPageTopBarMenuItem) => void;
}

export const MainPageTopBar: React.FC<MainPageTopBarProps> = ({
    activeKeys,
    avatarSrc,
    generateAvatar,
    popMenu,
    topBarMenu,
    userName,
    onClick,
    onClickTopBarMenu,
}) => {
    return (
        <div className="main-page-top-bar-container">
            <div className="main-page-top-bar-left">
                <div className="main-page-top-bar-avatar">
                    <MainPageNavAvatar
                        activeKeys={activeKeys}
                        avatarSrc={avatarSrc}
                        generateAvatar={generateAvatar}
                        popMenu={popMenu}
                        userName={userName}
                        onClick={onClick}
                    />
                </div>
                <span className="main-page-top-bar-user-name">{userName}</span>
            </div>
            <div className="main-page-top-bar-right">
                {topBarMenu.map(menuItem => {
                    return (
                        <a
                            key={menuItem.key}
                            className="main-page-top-bar-menu"
                            onClick={() => onClickTopBarMenu(menuItem)}
                        >
                            {menuItem.icon}
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

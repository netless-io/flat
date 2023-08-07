import "./style.less";

import React from "react";
import { MainPageNavAvatar, MainPageNavAvatarProps } from "../MainPageNavAvatar";
import { MainPageTopBarMenuItem, WindowsSystemBtnItem } from "../types";
import { WindowsSystemBtn } from "./WindowsSystemBtn";

export interface MainPageTopBarProps extends MainPageNavAvatarProps {
    topBarMenu: MainPageTopBarMenuItem[];
    showWindowsSystemBtn?: boolean;
    onMinimizeClick?: () => void;
    onCloseClick?: () => void;
    onClickTopBarMenu: (menuItem: MainPageTopBarMenuItem) => void;
    onClickWindowsSystemBtn?: (winSystemBtn: WindowsSystemBtnItem) => void;
}

export const MainPageTopBar: React.FC<MainPageTopBarProps> = ({
    userUUID,
    activeKeys,
    avatarSrc,
    popMenu,
    topBarMenu,
    userName,
    showWindowsSystemBtn,
    generateAvatar,
    onClick,
    onClickTopBarMenu,
    onClickWindowsSystemBtn,
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
                        userUUID={userUUID}
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
                            title={menuItem.htmlTitle}
                            onClick={() => onClickTopBarMenu(menuItem)}
                        >
                            {menuItem.icon}
                        </a>
                    );
                })}
                {onClickWindowsSystemBtn && showWindowsSystemBtn && (
                    <>
                        <div className="main-page-top-bar-divider" />
                        <WindowsSystemBtn
                            hiddenMaximizeBtn={true}
                            onClickWindowsSystemBtn={onClickWindowsSystemBtn}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

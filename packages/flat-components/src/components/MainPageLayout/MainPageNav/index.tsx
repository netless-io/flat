import "./style.less";
import React from "react";
import classNames from "classnames";
import { MainPageLayoutItem } from "../types";
import { MainPageNavAvatar, MainPageNavAvatarProps } from "../MainPageNavAvatar";

export interface MainPageNavProps extends MainPageNavAvatarProps {
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
    /** outside side menu in MainPageLayout */
    sideMenu: MainPageLayoutItem[];
    /** outside footer menu in MainPageLayout */
    sideMenuFooter: MainPageLayoutItem[];
    /** function to generate placeholder avatar */
    generateAvatar: (uid: string) => string;
}

export const MainPageNav: React.FC<MainPageNavProps> = ({
    avatarSrc,
    userName,
    onClick,
    activeKeys,
    sideMenu,
    sideMenuFooter,
    generateAvatar,
    popMenu,
}) => {
    return (
        <div className="main-page-nav-container">
            <div className="main-page-nav-header">
                <MainPageNavAvatar
                    avatarSrc={avatarSrc}
                    userName={userName}
                    onClick={onClick}
                    activeKeys={activeKeys}
                    popMenu={popMenu}
                    generateAvatar={generateAvatar}
                />
            </div>
            <div className="main-page-nav-content">
                {sideMenu.map(menuItem => {
                    return (
                        <a
                            key={menuItem.key}
                            className={classNames({
                                "is-active": activeKeys.includes(menuItem.key),
                            })}
                            href={menuItem.route}
                            onClick={e => {
                                e.preventDefault();
                                onClick(menuItem);
                            }}
                        >
                            {menuItem.icon(activeKeys.includes(menuItem.key))}
                        </a>
                    );
                })}
            </div>
            <div className="main-page-nav-footer">
                {sideMenuFooter.map(menuItem => {
                    return (
                        <a
                            key={menuItem.key}
                            className={classNames({
                                "is-active": activeKeys.includes(menuItem.key),
                            })}
                            href={menuItem.route}
                            onClick={e => {
                                e.preventDefault();
                                onClick(menuItem);
                            }}
                        >
                            {menuItem.icon(activeKeys.includes(menuItem.key))}
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

import "./style.less";

import { Avatar, Divider, Popover } from "antd";
import React, { useState } from "react";
import { MainPageLayoutItem } from "../types";

export interface MainPageNavAvatarProps {
    userUUID: string;
    /** user avatar src*/
    avatarSrc: string;
    /** user name */
    userName: string;
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
    /** appear when click avatar component */
    popMenu: MainPageLayoutItem[];
    /** function to generate placeholder avatar */
    generateAvatar: (uid: string) => string;
}

export const MainPageNavAvatar: React.FC<MainPageNavAvatarProps> = ({
    userUUID,
    avatarSrc,
    userName,
    onClick,
    activeKeys,
    popMenu,
    generateAvatar,
}) => {
    const [popMenuVisible, setPopMenuVisible] = useState(false);
    const [isAvatarLoadFailed, setAvatarLoadFailed] = useState(false);

    const avatar = isAvatarLoadFailed || !avatarSrc ? generateAvatar(userUUID) : avatarSrc;

    const togglePopMenuVisible = (): void => {
        setPopMenuVisible(!popMenuVisible);
    };

    return (
        <Popover
            content={renderPopMenuInner}
            open={popMenuVisible}
            overlayClassName="main-page-nav-popover"
            placement="bottomRight"
            title={renderPopMenuTitle}
            trigger="click"
            onOpenChange={togglePopMenuVisible}
        >
            <Avatar
                className="main-page-nav-avatar"
                icon={<img src={avatar} onError={() => avatar && setAvatarLoadFailed(true)} />}
                size={24}
            />
        </Popover>
    );

    function renderPopMenuInner(): React.ReactElement {
        return (
            <div className="main-page-pop-menu">
                <Divider />
                {popMenu.map(menuItem => {
                    return (
                        <a
                            key={menuItem.key}
                            className="main-page-pop-menu-item"
                            onClick={e => {
                                e.preventDefault();
                                onClick(menuItem);
                                togglePopMenuVisible();
                            }}
                        >
                            <span className="main-page-pop-menu-item-icon">
                                {menuItem.icon(activeKeys.includes(menuItem.key))}
                            </span>
                            {menuItem.title}
                        </a>
                    );
                })}
            </div>
        );
    }

    function renderPopMenuTitle(): React.ReactElement {
        return (
            <div className="main-page-nav-pop-menu-title">
                <span>{userName}</span>
            </div>
        );
    }
};

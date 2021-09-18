import "./style.less";

import { Avatar, Divider, Popover } from "antd";
import React, { useState } from "react";
import { MainPageLayoutItem } from "../types";

export interface MainPageNavAvatarProps {
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
    avatarSrc,
    userName,
    onClick,
    activeKeys,
    popMenu,
    generateAvatar,
}) => {
    const [popMenuVisible, setPopMenuVisible] = useState(false);
    const [isAvatarLoadFailed, setAvatarLoadFailed] = useState(false);

    const avatar = isAvatarLoadFailed ? generateAvatar(avatarSrc) : avatarSrc;

    const togglePopMenuVisible = (): void => {
        setPopMenuVisible(!popMenuVisible);
    };

    return (
        <Popover
            trigger="click"
            placement="bottomRight"
            overlayClassName="main-page-nav-popover"
            title={renderPopMenuTitle}
            visible={popMenuVisible}
            onVisibleChange={togglePopMenuVisible}
            content={renderPopMenuInner}
        >
            <Avatar
                className="main-page-nav-avatar"
                size={32}
                icon={<img src={avatar} onError={() => setAvatarLoadFailed(true)} />}
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
                            className="main-page-pop-menu-item "
                            onClick={e => {
                                e.preventDefault();
                                onClick(menuItem);
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

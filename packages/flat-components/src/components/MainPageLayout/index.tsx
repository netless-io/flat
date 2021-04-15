import "./style.less";
import { Avatar, Divider, Popover } from "antd";
import React, { useState } from "react";
import classNames from "classnames";

export interface MainPageLayoutItem {
    key: string;
    icon: (active: boolean) => React.ReactNode;
    title: React.ReactNode;
    route: string;
}

export interface MainPageLayoutProps {
    /** user avatar src*/
    avatarSrc: string;
    /** user name */
    userName: string;
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
    /** outside side menu in MainPageLayout */
    sideMenu: MainPageLayoutItem[];
    /** outside footer menu in MainPageLayout */
    sideMenuFooter: MainPageLayoutItem[];
    /** appear when click avatar component */
    popMenu: MainPageLayoutItem[];
    /** inside sub menu in MainPageLayout */
    subMenu?: MainPageLayoutItem[];
}

export const MainPageLayout: React.FC<MainPageLayoutProps> = ({
    avatarSrc,
    userName,
    onClick,
    activeKeys,
    sideMenu,
    sideMenuFooter,
    popMenu,
    subMenu,
    children,
}) => {
    const [popHide, popHideState] = useState(false);

    const changePopHideState = (): void => {
        popHideState(!popHide);
    };

    function renderPopMenuInner(): React.ReactElement {
        return (
            <div className="popmenu-container">
                <Divider />
                {popMenu.map(menuItem => {
                    return (
                        <a
                            key={menuItem.key}
                            className="popmenu-item main-layout-menu-link"
                            onClick={e => {
                                e.preventDefault();
                                onClick(menuItem);
                            }}
                        >
                            <span className="popmenu-item-icon">
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
            <div className="popmenu-title">
                <span>{userName}</span>
            </div>
        );
    }

    return (
        <div className="main-layout-container">
            <div className="main-layout-side-menu-container">
                <div className="main-layout-container-header">
                    <Popover
                        trigger="click"
                        placement="bottomRight"
                        overlayClassName="main-layout-container-popover"
                        title={renderPopMenuTitle}
                        visible={popHide}
                        onVisibleChange={changePopHideState}
                        content={renderPopMenuInner}
                    >
                        <Avatar size={32} icon={<img src={avatarSrc} />} />
                    </Popover>
                </div>
                <div className="side-menu-container">
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
                <div className="side-menu-footer-container">
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
            {subMenu && (
                <div className="main-layout-sub-menu-container">
                    <ul>
                        {subMenu.map(menuItem => {
                            return (
                                <li key={menuItem.key}>
                                    <a
                                        className={classNames(
                                            "sub-menu-item main-layout-menu-link",
                                            {
                                                "is-active": activeKeys.includes(menuItem.key),
                                            },
                                        )}
                                        onClick={e => {
                                            e.preventDefault();
                                            onClick(menuItem);
                                        }}
                                    >
                                        <span className="sub-menu-item-icon">
                                            {menuItem.icon(activeKeys.includes(menuItem.key))}
                                        </span>
                                        {menuItem.title}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
            <div className="main-layout-container-content fancy-scrollbar">{children}</div>
        </div>
    );
};

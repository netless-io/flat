import "./style.less";
import React from "react";
import classNames from "classnames";
import { MainPageLayoutItem } from "../types";
import { MainPageNavAvatar, MainPageNavAvatarProps } from "../MainPageNavAvatar";
import { Tabs } from "antd";
import { MainPageHeader, MainPageHeaderProps } from "../MainPageHeader";

export interface MainPageNavHorizontalProps extends MainPageNavAvatarProps, MainPageHeaderProps {
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
    /** outside side menu in MainPageLayout */
    leftMenu: MainPageLayoutItem[];
    /** outside footer menu in MainPageLayout */
    rightMenu: MainPageLayoutItem[];
    /** display return to previous page button if provided*/
    onBackPreviousPage?: () => void;
}

export const MainPageNavHorizontal: React.FC<MainPageNavHorizontalProps> = ({
    avatarSrc,
    userName,
    onClick,
    activeKeys,
    leftMenu,
    rightMenu,
    popMenu,
    onBackPreviousPage,
    title,
}) => {
    const { TabPane } = Tabs;

    return (
        <div className="main-page-nav-horizontal-container">
            <div className="main-page-nav-horizontal-content">
                <div className="main-page-nav-horizontal-left">
                    {onBackPreviousPage ? (
                        <MainPageHeader title={title} onBackPreviousPage={onBackPreviousPage} />
                    ) : (
                        <Tabs
                            activeKey={
                                activeKeys.find(key =>
                                    leftMenu.some(menuItem => menuItem.key === key),
                                ) || "none"
                            }
                            onChange={key => {
                                const item = leftMenu.find(e => e.key === key);
                                if (item) {
                                    onClick(item);
                                } else {
                                    if (process.env.NODE_ENV === "development") {
                                        console.warn("[MainPageNav] tab missing key", key);
                                    }
                                }
                            }}
                        >
                            {leftMenu.map(menuItem => {
                                return <TabPane tab={menuItem.title} key={menuItem.key}></TabPane>;
                            })}
                        </Tabs>
                    )}
                </div>
                <div className="main-page-nav-horizontal-right">
                    {rightMenu.map(menuItem => {
                        return (
                            <a
                                key={menuItem.key}
                                className={classNames("main-page-nav-horizontal-right-item", {
                                    "is-active": activeKeys.includes(menuItem.key),
                                })}
                                href={menuItem.route}
                                onClick={e => {
                                    e.preventDefault();
                                    onClick(menuItem);
                                }}
                            >
                                <span className="main-page-nav-horizontal-right-item-img">
                                    {menuItem.icon(activeKeys.includes(menuItem.key))}
                                </span>
                                <span className="main-page-nav-horizontal-right-item-title">
                                    {menuItem.title}
                                </span>
                            </a>
                        );
                    })}
                    <div className="main-page-nav-horizontal-right-header">
                        <MainPageNavAvatar
                            avatarSrc={avatarSrc}
                            userName={userName}
                            onClick={onClick}
                            activeKeys={activeKeys}
                            popMenu={popMenu}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

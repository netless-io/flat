import "./style.less";

import React from "react";
import classNames from "classnames";
import { MainPageLayoutItem } from "../types";

export interface MainPageSubMenuProps {
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
    /** inside sub menu in MainPageLayout */
    subMenu: MainPageLayoutItem[];
}

export const MainPageSubMenu: React.FC<MainPageSubMenuProps> = ({
    subMenu,
    onClick,
    activeKeys,
}) => {
    return (
        <div className="main-layout-sub-menu">
            <ul>
                {subMenu.map(menuItem => {
                    return (
                        <li key={menuItem.key}>
                            <a
                                className={classNames("main-layout-sub-menu-item", {
                                    "is-active": activeKeys.includes(menuItem.key),
                                })}
                                onClick={e => {
                                    e.preventDefault();
                                    onClick(menuItem);
                                }}
                            >
                                <span className="main-layout-sub-menu-item-icon">
                                    {menuItem.icon(activeKeys.includes(menuItem.key))}
                                </span>
                                {menuItem.title}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

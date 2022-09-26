import "./style.less";

import React, { useCallback } from "react";
import classNames from "classnames";
import { MainPageLayoutItem, MainPageLayoutTreeItem } from "../types";
import { useState } from "react";
import { SVGDown, SVGUp } from "../../FlatIcons";

export interface MainPageSubMenuProps {
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
    /** inside sub menu in MainPageLayout */
    subMenu: MainPageLayoutTreeItem[];
}

export interface MainPageSubMenuItemProps {
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    activeKeys: string[];
    menuItem: MainPageLayoutTreeItem;
}

const renderNormalItem = ({
    menuItem,
    onClick,
    activeKeys,
}: MainPageSubMenuItemProps): React.ReactNode => {
    return (
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
    );
};

const renderFolderItem = (
    { menuItem, activeKeys }: MainPageSubMenuItemProps,
    expanded: boolean,
    toggleExpanded: () => void,
): React.ReactNode => {
    return (
        <a
            className={classNames("main-layout-sub-menu-item", "is-folder")}
            onClick={toggleExpanded}
        >
            <span className="main-layout-sub-menu-item-icon">
                {menuItem.icon(activeKeys.includes(menuItem.key))}
            </span>
            {menuItem.title}
            <span className="main-layout-sub-menu-item-expand">
                {expanded ? <SVGUp /> : <SVGDown />}
            </span>
        </a>
    );
};

const MainPageSubMenuItem: React.FC<MainPageSubMenuItemProps> = props => {
    const { menuItem, onClick, activeKeys } = props;
    const [expanded, setExpanded] = useState(() => {
        if (menuItem.children) {
            return menuItem.children.some(item => activeKeys.includes(item.key));
        }
        return false;
    });

    const toggleExpanded = useCallback(() => setExpanded(collapsed => !collapsed), []);

    return (
        <li className={classNames({ expanded })}>
            {menuItem.children
                ? renderFolderItem(props, expanded, toggleExpanded)
                : renderNormalItem(props)}
            {menuItem.children && (
                <ul>
                    {menuItem.children.map(child => (
                        <MainPageSubMenuItem
                            key={child.key}
                            activeKeys={activeKeys}
                            menuItem={child}
                            onClick={onClick}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export const MainPageSubMenu: React.FC<MainPageSubMenuProps> = ({
    subMenu,
    onClick,
    activeKeys,
}) => {
    return (
        <div className="main-layout-sub-menu">
            <ul>
                {subMenu.map(menuItem => (
                    <MainPageSubMenuItem
                        key={menuItem.key}
                        activeKeys={activeKeys}
                        menuItem={menuItem}
                        onClick={onClick}
                    />
                ))}
            </ul>
        </div>
    );
};

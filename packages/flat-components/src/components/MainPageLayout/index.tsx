import "./style.less";
import React from "react";
import classNames from "classnames";
import { MainPageLayoutItem } from "./types";
import { MainPageNav, MainPageNavProps } from "./MainPageNav";

export * from "./MainPageHeader";
export type { MainPageLayoutItem } from "./types";

export interface MainPageLayoutProps extends MainPageNavProps {
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
    /** inside sub menu in MainPageLayout */
    subMenu?: MainPageLayoutItem[];
}

export const MainPageLayout: React.FC<MainPageLayoutProps> = ({
    onClick,
    activeKeys,
    subMenu,
    children,
    ...restProps
}) => {
    return (
        <div className="main-layout-container">
            <MainPageNav {...restProps} onClick={onClick} activeKeys={activeKeys} />
            {subMenu && (
                <div className="main-layout-sub-menu-container">
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
            )}
            <div className="main-layout-container-content fancy-scrollbar">{children}</div>
        </div>
    );
};

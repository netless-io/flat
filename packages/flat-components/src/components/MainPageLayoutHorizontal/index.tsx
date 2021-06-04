import "./style.less";
import React from "react";
import classNames from "classnames";
import { MainPageLayoutItem } from "../MainPageLayout/types";
import {
    MainPageNavHorizontal,
    MainPageNavHorizontalProps,
} from "../MainPageLayout/MainPageNavHorizontal";

export * from "../MainPageLayout/MainPageHeader";
export type { MainPageLayoutItem } from "../MainPageLayout/types";

export interface MainPageLayoutHorizontalProps extends MainPageNavHorizontalProps {
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
    /** inside sub menu in MainPageLayout */
    subMenu?: MainPageLayoutItem[];
}

export const MainPageLayoutHorizontal: React.FC<MainPageLayoutHorizontalProps> = ({
    onClick,
    activeKeys,
    subMenu,
    children,
    ...restProps
}) => {
    return (
        <div className="main-horizontal-layout-container">
            <MainPageNavHorizontal {...restProps} onClick={onClick} activeKeys={activeKeys} />
            {subMenu && (
                <div className="main-horizontal-layout-sub-menu-container">
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
            <div className="main-horizontal-layout-container-content fancy-scrollbar">
                {children}
            </div>
        </div>
    );
};

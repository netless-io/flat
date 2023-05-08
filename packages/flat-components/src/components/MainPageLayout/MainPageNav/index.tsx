import "./style.less";

import React from "react";
import classNames from "classnames";
import { MainPageLayoutItem } from "../types";
import { SVGLogo } from "../../FlatIcons";

export interface MainPageNavProps {
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
    /** outside side menu in MainPageLayout */
    sideMenu: MainPageLayoutItem[];
    /** outside footer menu in MainPageLayout */
    sideMenuFooter: MainPageLayoutItem[];
    /** add extra padding top to the logo */
    isMac?: boolean;
}

export const MainPageNav: React.FC<MainPageNavProps> = ({
    onClick,
    activeKeys,
    sideMenu,
    sideMenuFooter,
    isMac,
}) => {
    return (
        <div className="main-page-nav-container">
            <div className="main-page-nav-content">
                <SVGLogo className={classNames("main-page-nav-logo", { isMac })} />
                {sideMenu.map(menuItem => {
                    return (
                        <a
                            key={menuItem.key}
                            className={classNames("main-page-nav-btn", {
                                "is-active": activeKeys.includes(menuItem.key),
                            })}
                            href={menuItem.route}
                            title={menuItem.htmlTitle}
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
                            className={classNames("main-page-nav-btn", {
                                "is-active": activeKeys.includes(menuItem.key),
                            })}
                            href={menuItem.route}
                            title={menuItem.htmlTitle}
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

import "./style.less";
import React from "react";
import { MainPageLayoutItem } from "./types";
import { MainPageNav, MainPageNavProps } from "./MainPageNav";
import { MainPageSubMenu, MainPageSubMenuProps } from "./MainPageSubMenu";
import { MainPageTopBar, MainPageTopBarProps } from "./MainPageTopBar";

export * from "./MainPageHeader";
export type { MainPageLayoutItem, MainPageTopBarMenuItem, WindowsSystemBtnItem } from "./types";

export interface MainPageLayoutProps
    extends MainPageNavProps,
        MainPageTopBarProps,
        Partial<Omit<MainPageSubMenuProps, "onClick" | "activeKeys">> {
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
}

export const MainPageLayout: React.FC<MainPageLayoutProps> = ({
    onClick,
    activeKeys,
    subMenu,
    children,
    ...restProps
}) => {
    return (
        <div className="main-page-layout main-page-layout--spilt">
            <MainPageNav {...restProps} activeKeys={activeKeys} onClick={onClick} />
            <div className="main-page-layout-main">
                <MainPageTopBar {...restProps} activeKeys={activeKeys} onClick={onClick} />
                <div className="main-page-layout-content main-page-layout--spilt fancy-scrollbar">
                    {subMenu && (
                        <MainPageSubMenu
                            activeKeys={activeKeys}
                            subMenu={subMenu}
                            onClick={onClick}
                        />
                    )}
                    <div className="main-page-layout-inner fancy-scrollbar">{children}</div>
                </div>
            </div>
        </div>
    );
};

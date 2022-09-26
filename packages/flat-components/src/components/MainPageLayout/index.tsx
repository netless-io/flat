import "./style.less";
import React from "react";
import { MainPageLayoutItem } from "./types";
import { MainPageNav, MainPageNavProps } from "./MainPageNav";
import { MainPageSubMenu, MainPageSubMenuProps } from "./MainPageSubMenu";
import { MainPageTopBar, MainPageTopBarProps } from "./MainPageTopBar";
import { MainPageHeader, MainPageHeaderProps } from "./MainPageHeader";

export * from "./MainPageHeader";
export * from "./types";

export interface MainPageLayoutProps
    extends MainPageNavProps,
        MainPageTopBarProps,
        MainPageHeaderProps,
        Partial<Omit<MainPageSubMenuProps, "onClick" | "activeKeys">> {
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
    showMainPageHeader?: boolean;
}

export const MainPageLayout: React.FC<MainPageLayoutProps> = ({
    onClick,
    activeKeys,
    subMenu,
    children,
    showMainPageHeader,
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
                    <div className="main-page-layout-inner fancy-scrollbar">
                        {showMainPageHeader ? (
                            <div className="main-page-layout-content-detail-container">
                                <MainPageHeader {...restProps} />
                                <div className="main-page-layout-content-detail">{children}</div>
                            </div>
                        ) : (
                            <>{children}</>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

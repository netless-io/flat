import React from "react";
import { MainPageNav, MainPageNavProps } from "./MainPageNav";
import { MainPageSubMenu, MainPageSubMenuProps } from "./MainPageSubMenu";
import { MainPageLayoutItem } from "./types";
import "./style.less";

export * from "./MainPageHeader";
export type { MainPageLayoutItem } from "./types";

export interface MainPageLayoutProps
    extends MainPageNavProps,
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
        <div className="main-layout-container">
            <MainPageNav {...restProps} activeKeys={activeKeys} onClick={onClick} />
            {subMenu && (
                <MainPageSubMenu activeKeys={activeKeys} subMenu={subMenu} onClick={onClick} />
            )}
            <div className="main-layout-container-content fancy-scrollbar">{children}</div>
        </div>
    );
};

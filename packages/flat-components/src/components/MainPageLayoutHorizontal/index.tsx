import React from "react";
import {
    MainPageNavHorizontal,
    MainPageNavHorizontalProps,
} from "../MainPageLayout/MainPageNavHorizontal";
import { MainPageSubMenu, MainPageSubMenuProps } from "../MainPageLayout/MainPageSubMenu";
import { MainPageLayoutItem } from "../MainPageLayout/types";
import "./style.less";

export interface MainPageLayoutHorizontalProps
    extends MainPageNavHorizontalProps,
        Partial<Omit<MainPageSubMenuProps, "onClick" | "activeKeys">> {
    /** when an item is clicked */
    onClick: (mainPageLayoutItem: MainPageLayoutItem) => void;
    /** a list of keys to highlight the items */
    activeKeys: string[];
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
            <MainPageNavHorizontal {...restProps} activeKeys={activeKeys} onClick={onClick} />
            <div className="main-horizontal-layout-content-background fancy-scrollbar">
                <div className="main-horizontal-layout-content-container">
                    {subMenu && (
                        <MainPageSubMenu
                            activeKeys={activeKeys}
                            subMenu={subMenu}
                            onClick={onClick}
                        />
                    )}
                    <div className="main-horizontal-layout-content">{children}</div>
                </div>
            </div>
        </div>
    );
};

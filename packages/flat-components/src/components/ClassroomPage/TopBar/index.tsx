import "./style.less";

import React, { ReactElement, FC } from "react";
import classNames from "classnames";

export * from "./TopBarRightBtn";
export * from "./TopBarRoundBtn";

export const TopBarDivider: FC = () => {
    return <div className="topbar-divider"></div>;
};

export interface TopBarProps {
    left: ReactElement;
    center: ReactElement;
    right: ReactElement;
    isMac?: boolean;
}

export const TopBar: FC<TopBarProps> = ({ left, center, right, isMac }) => (
    <div className={classNames("topbar-box", { isMac })}>
        <div className="topbar-content-left">{left}</div>
        <div className="topbar-content-center">{center}</div>
        <div className="topbar-content-right">{right}</div>
    </div>
);

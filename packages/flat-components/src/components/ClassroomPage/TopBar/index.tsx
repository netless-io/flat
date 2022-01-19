import React, { FC, ReactNode } from "react";
import classNames from "classnames";
import "./style.less";

export * from "./TopBarRightBtn";
export * from "./TopBarRoundBtn";

export const TopBarDivider: FC = () => {
    return <div className="topbar-divider"></div>;
};

export interface TopBarProps {
    left?: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
    isMac?: boolean;
}

export const TopBar: FC<TopBarProps> = ({ left, center, right, isMac }) => (
    <div className={classNames("topbar-box", { isMac })}>
        <div className="topbar-content-left">{left}</div>
        <div className="topbar-content-center">{center}</div>
        <div className="topbar-content-right">{right}</div>
    </div>
);

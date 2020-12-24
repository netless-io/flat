import React from "react";
import classNames from "classnames";
import { runtime } from "../utils/runtime";

import "./TopBar.less";

export interface TopBarProps {
    left: React.ReactNode;
    center: React.ReactNode;
    right: React.ReactNode;
}

export class TopBar extends React.Component<TopBarProps> {
    render(): React.ReactNode {
        const { left, center, right } = this.props;
        return (
            <div className={classNames("topbar-box", { isMac: runtime.isMac })}>
                <div className="topbar-content-left">{left}</div>
                <div className="topbar-content-center">{center}</div>
                <div className="topbar-content-right">{right}</div>
            </div>
        );
    }
}

export default TopBar;

export const TopBarDivider: React.FC = () => {
    return <div className="topbar-divider"></div>;
};

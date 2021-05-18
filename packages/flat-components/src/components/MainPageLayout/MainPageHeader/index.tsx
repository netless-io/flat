import backSVG from "./icons/back.svg";
import "./index.less";

import React from "react";
import { Link } from "react-router-dom";
import { Divider } from "antd";

export interface MainPageHeaderProps {
    routePath: string;
    title: React.ReactNode;
}

export const MainPageHeader: React.FC<MainPageHeaderProps> = ({ routePath, title }) => {
    return (
        <div className="main-page-header-container">
            <Link to={routePath}>
                <div className="main-page-header-back">
                    <img src={backSVG} alt="back" />
                    <span>返回</span>
                </div>
            </Link>
            <Divider type="vertical" />
            {title}
        </div>
    );
};

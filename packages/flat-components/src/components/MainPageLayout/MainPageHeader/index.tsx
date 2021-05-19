import backSVG from "./icons/back.svg";
import "./index.less";

import React from "react";
import { Divider } from "antd";

export interface MainPageHeaderProps {
    onBackPreviousPage: () => void;
    title: React.ReactNode;
}

export const MainPageHeader: React.FC<MainPageHeaderProps> = ({ onBackPreviousPage, title }) => {
    return (
        <div className="main-page-header-container">
            <div className="main-page-header-back" onClick={onBackPreviousPage}>
                <img src={backSVG} alt="back" />
                <span>返回</span>
            </div>
            <Divider type="vertical" />
            {title}
        </div>
    );
};

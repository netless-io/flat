import backSVG from "./icons/back.svg";
import "./index.less";

import React from "react";
import { Divider } from "antd";
import { useTranslate } from "@netless/flat-i18n";

export interface MainPageHeaderProps {
    onBackPreviousPage?: () => void;
    title?: React.ReactNode;
}

export const MainPageHeader: React.FC<MainPageHeaderProps> = ({ onBackPreviousPage, title }) => {
    const t = useTranslate();
    return (
        <div className="main-page-header-container">
            <div className="main-page-header-back" onClick={onBackPreviousPage}>
                <img alt="back" src={backSVG} />
                <span>{t("back")}</span>
            </div>
            <Divider type="vertical" />
            {title}
        </div>
    );
};

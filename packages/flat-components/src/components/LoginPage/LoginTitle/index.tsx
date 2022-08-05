import "./index.less";

import React from "react";
import { useTranslate } from "@netless/flat-i18n";

export interface LoginTitleProps {
    title?: string;
    subtitle?: string;
}

export const LoginTitle: React.FC<LoginTitleProps> = ({ title, subtitle }) => {
    const t = useTranslate();

    return (
        <div className="login-title">
            <h2 className="login-title-text">{title || t("app-welcome")}</h2>
            <p className="login-title-subtext">
                {subtitle || t("online-interaction-to-synchronize-ideas")}
            </p>
        </div>
    );
};

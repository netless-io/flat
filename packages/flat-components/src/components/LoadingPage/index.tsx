import "./style.less";
import loadingGIF from "./icons/loading.gif";

import React, { FC, useEffect, useState } from "react";
import { Button } from "antd";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface LoadingPageProps {
    text?: string;
}

export const LoadingPage: FC<LoadingPageProps> = ({ text }) => {
    const [isShowReturnHomePage, showReturnHomePage] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const ticket = window.setTimeout(() => showReturnHomePage(true), 20000);
        return () => window.clearTimeout(ticket);
    }, []);

    return (
        <div className="loading-page">
            <div className="loading-page-content">
                <img className="loading-page-image" src={loadingGIF} alt="loading" />
                {text && <span>{text}</span>}
            </div>
            <Link
                to="/"
                className={classNames("loading-page-return-btn", {
                    "is-show": isShowReturnHomePage,
                })}
            >
                <Button size="large">{t("return-home")}</Button>
            </Link>
        </div>
    );
};

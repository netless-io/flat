import errorSVG from "./icons/error.svg";
import "./style.less";

import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export type ErrorPageProps = {};

export const ErrorPage: React.FC = () => {
    const [countdown, setCountdown] = useState(15);
    const location = useLocation();
    const history = useHistory();
    const { t } = useTranslation();

    const goHome = (): void => {
        if (location.pathname !== "/") {
            history.push("/");
        } else {
            window.location.reload();
        }
    };

    useEffect(() => {
        let countdown = 15;
        const ticket = window.setInterval(() => {
            if (--countdown < 0) {
                window.clearInterval(ticket);
                goHome();
                return;
            }
            setCountdown(countdown);
        }, 1000);

        return () => {
            window.clearInterval(ticket);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="error-page">
            <img className="error-page-image" src={errorSVG} />
            <p className="error-page-title">{t("error-page-title")}</p>
            <p className="error-page-description">{t("error-page-description")}</p>
            <Button size="large" onClick={goHome}>
                {t("error-page-return-home", { countdown })}
            </Button>
        </div>
    );
};

export default ErrorPage;

import "./style.less";

import React, { FC, useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { Button } from "antd";
import { useTranslate } from "@netless/flat-i18n";

export interface LoadingPageProps {
    text?: string;
    timeMS?: number;
    hasHeader?: boolean;
    onTimeout?: "return-home" | "full-reload" | (() => void);
    onTimeoutText?: string;
}

export const LoadingPage: FC<LoadingPageProps> = ({
    text,
    timeMS = 20 * 1000,
    hasHeader,
    onTimeout = "return-home",
    onTimeoutText,
}) => {
    const [isShowReturnHomePage, showReturnHomePage] = useState(false);
    const t = useTranslate();

    useEffect(() => {
        const ticket = window.setTimeout(() => showReturnHomePage(true), timeMS);
        return () => window.clearTimeout(ticket);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const timeoutText =
        onTimeoutText || (typeof onTimeout === "string" ? t(onTimeout) : t("return-home"));

    const timeoutBehavior = useCallback(
        (type: "return-home" | "full-reload") => () => {
            if (type === "return-home") {
                window.location.pathname = "/";
            }
            if (type === "full-reload") {
                window.location.reload();
            }
        },
        [],
    );

    return (
        <div className="loading-page">
            <div
                className={classNames("loading-page-mask", {
                    "is-transparent": hasHeader,
                })}
            />
            <div className="loading-page-content">
                <div className="loading-page-image" />
                {text && <span>{text}</span>}
            </div>
            <Button
                className={classNames("loading-page-return-btn", {
                    "is-show": isShowReturnHomePage,
                })}
                size="large"
                onClick={typeof onTimeout === "string" ? timeoutBehavior(onTimeout) : onTimeout}
            >
                {timeoutText}
            </Button>
        </div>
    );
};

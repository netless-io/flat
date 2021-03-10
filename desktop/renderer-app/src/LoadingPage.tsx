import loading from "./assets/image/loading.gif";
import "./LoadingPage.less";

import React, { FC, useEffect, useState } from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import classNames from "classnames";

export interface LoadingPageProps {
    text?: string;
}

export const LoadingPage: FC<LoadingPageProps> = ({ text }) => {
    const [isShowReturnHomePage, showReturnHomePage] = useState(false);

    useEffect(() => {
        const ticket = window.setTimeout(() => {
            showReturnHomePage(true);
        }, 20000);

        return () => {
            window.clearTimeout(ticket);
        };
    }, []);

    return (
        <div className="loading-page-container">
            <div className="loading-page-content">
                <img className="loading-page-image" src={loading} alt={"loading"} />
                {text && <span>{text}</span>}
            </div>
            <Link
                to={"/"}
                className={classNames("loading-page-return-btn", {
                    "is-show": isShowReturnHomePage,
                })}
            >
                <Button size="large">返回首页</Button>
            </Link>
        </div>
    );
};

export default LoadingPage;

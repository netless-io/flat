import loading from "./assets/image/loading.gif";
import "./LoadingPage.less";

import React, { FC } from "react";

export interface LoadingPageProps {
    text?: string;
}

export const LoadingPage: FC<LoadingPageProps> = ({ text }) => {
    return (
        <div className="loading-page-container">
            <img className="loading-page-image" src={loading} alt={"loading"} />
            {text && <span>{text}</span>}
        </div>
    );
};

export default LoadingPage;

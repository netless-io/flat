import roomNotFindSVG from "./assets/image/room_not_find.svg";
import "./PageError.less";

import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import { RouteNameType, usePushHistory } from "./utils/routes";

export const PageError = React.memo(function PageError() {
    const [countDown, setCountDown] = useState(15);
    const pushHistory = usePushHistory();

    useEffect(() => {
        let countDown = 15;
        const ticket = window.setInterval(() => {
            if (--countDown < 0) {
                window.clearInterval(ticket);
                pushHistory(RouteNameType.HomePage);
                return;
            }
            setCountDown(countDown);
        }, 1000);

        return () => {
            window.clearInterval(ticket);
        };
    }, [pushHistory]);

    return (
        <div className="page404-box">
            <div className="page404-image-box">
                <img className="page404-image-inner" src={roomNotFindSVG} />
                <div className="page404-inner">
                    <div className="page404-inner-title">抱歉，遇到未知错误</div>
                    <div className="page404-inner-script">请重试</div>
                    <Link to={"/"}>
                        <Button size="large">({countDown}) 返回首页</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
});

export default PageError;

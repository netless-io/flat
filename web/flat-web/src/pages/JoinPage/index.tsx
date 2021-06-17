import logoSVG from "./icons/logo.svg";
import downloadSVG from "./icons/download.svg";
import joinSVG from "./icons/join.svg";
import "./style.less";

import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext, PageStoreContext } from "../../components/StoreProvider";
import { loginCheck } from "../../apiMiddleware/flatServer";
import { joinRoomHandler } from "../utils/joinRoomHandler";
import { Avatar, Button } from "antd";
import { useParams } from "react-router-dom";

export const JoinPage = observer(function JoinPage() {
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const pageStore = useContext(PageStoreContext);
    const [isLogin, setIsLogin] = useState(false);

    const params = useParams<RouteParams<RouteNameType.ReplayPage>>();
    const { roomUUID } = params;

    (window as any).pageStore = pageStore;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    useEffect(() => {
        async function checkLogin(): Promise<void> {
            const token = globalStore.userInfo?.token;
            if (token) {
                try {
                    await loginCheck();
                    setIsLogin(true);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        checkLogin();

        window.location.href = "x-agora-flat-client://active";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function joinRoom(): Promise<void> {
        if (isLogin && roomUUID) {
            await joinRoomHandler(roomUUID, pushHistory);
        } else {
            sessionStorage.setItem("roomUUID", roomUUID);
            pushHistory(RouteNameType.LoginPage);
        }
    }

    return (
        <div className="join-page-container">
            <div className="join-page-header-container">
                <img src={logoSVG} alt="flat-logo" />
                {isLogin ? (
                    <Avatar
                        className="join-page-header-avatar"
                        size={32}
                        icon={<img src={globalStore.userInfo?.avatar ?? ""} />}
                    />
                ) : (
                    <div
                        className="join-page-header-btn"
                        onClick={() => {
                            if (roomUUID) {
                                sessionStorage.setItem("roomUUID", roomUUID);
                                pushHistory(RouteNameType.LoginPage);
                            }
                        }}
                    >
                        登录
                    </div>
                )}
            </div>
            <div className="join-page-content-container">
                <div className="join-page-content-title">请选择加入房间的方式</div>
                <div className="join-page-content-btn-container">
                    <Button
                        className="join-page-content-btn"
                        onClick={() =>
                            window.open("https://flat.whiteboard.agora.io/#download", "_blank")
                        }
                    >
                        <img src={downloadSVG} alt="download icon" />
                        <div className="join-page-content-text-container">
                            <div className="join-page-content-text">下载桌面端应用</div>
                            <span className="join-page-content-sub-text">获得完整的课堂体验</span>
                        </div>
                    </Button>
                    <Button className="join-page-content-btn" onClick={joinRoom}>
                        <img src={joinSVG} alt="join icon" />
                        <div className="join-page-content-text-container">
                            <div className="join-page-content-text">使用网页版加入房间</div>
                            <span className="join-page-content-sub-text">
                                无需下载应用, 快速加入
                            </span>
                        </div>
                    </Button>
                </div>
                <div className="join-page-content-divider">
                    <span>或</span>
                </div>
                <div className="join-page-content-container-open-flat">
                    <span>已经安装 Flat ? </span>
                    <a href="x-agora-flat-client://active">立即打开</a>
                </div>
            </div>
            <div className="join-page-footer-container">
                <a href={void 0}>隐私协议</a>
                <span>｜</span>
                <a href={void 0}>服务政策</a>
            </div>
        </div>
    );
});

export default JoinPage;

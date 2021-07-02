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
import { useTranslation } from "react-i18next";

export const JoinPage = observer(function JoinPage() {
    const { t } = useTranslation();
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const pageStore = useContext(PageStoreContext);
    const [isLogin, setIsLogin] = useState(false);

    const params = useParams<RouteParams<RouteNameType.ReplayPage>>();
    const { roomUUID } = params;

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

        window.location.href = `x-agora-flat-client://joinRoom?roomUUID=${roomUUID}`;
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
                        {t("login")}
                    </div>
                )}
            </div>
            <div className="join-page-content-container">
                <div className="join-page-content-title">{t("select-the-way-to-join-room")}</div>
                <div className="join-page-content-btn-container">
                    <Button
                        className="join-page-content-btn"
                        onClick={() =>
                            window.open("https://flat.whiteboard.agora.io/#download", "_blank")
                        }
                    >
                        <img src={downloadSVG} alt="download icon" />
                        <div className="join-page-content-text-container">
                            <div className="join-page-content-text">
                                {t("download-desktop-application")}
                            </div>
                            <span className="join-page-content-sub-text">
                                {t("download-desktop-application-tips")}
                            </span>
                        </div>
                    </Button>
                    <Button className="join-page-content-btn" onClick={joinRoom}>
                        <img src={joinSVG} alt="join icon" />
                        <div className="join-page-content-text-container">
                            <div className="join-page-content-text">
                                {t("web-version-join-room")}
                            </div>
                            <span className="join-page-content-sub-text">
                                {t("web-version-join-room-tips")}
                            </span>
                        </div>
                    </Button>
                </div>
                <div className="join-page-content-divider">
                    <span>{t("or")}</span>
                </div>
                <div className="join-page-content-container-open-flat">
                    <span>{t("already-installed-flat-tips")}</span>
                    <a href={`x-agora-flat-client://joinRoom?roomUUID=${roomUUID}`}>
                        {t("open-now")}
                    </a>
                </div>
            </div>
            <div className="join-page-footer-container">
                <a href={void 0}>{t("privacy-agreement")}</a>
                <span>｜</span>
                <a href={void 0}>{t("service-policy")}</a>
            </div>
        </div>
    );
});

export default JoinPage;

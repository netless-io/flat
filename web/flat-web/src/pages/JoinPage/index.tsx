import "./style.less";

import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWindowSize } from "react-use";

import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext, PageStoreContext } from "../../components/StoreProvider";
import { loginCheck } from "../../api-middleware/flatServer";
import { joinRoomHandler } from "../utils/join-room-handler";
import { PRIVACY_URL, PRIVACY_URL_CN, SERVICE_URL, SERVICE_URL_CN } from "../../constants/process";
import JoinPageDesktop from "./JoinPageDesktop";
import JoinPageMobile from "./JoinPageMobile";
import { NEED_BINDING_PHONE } from "../../constants/config";

export const JoinPage = observer(function JoinPage() {
    const { i18n } = useTranslation();
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const pageStore = useContext(PageStoreContext);
    const [isLogin, setIsLogin] = useState(false);
    const { width } = useWindowSize(1080);

    const params = useParams<RouteParams<RouteNameType.ReplayPage>>();
    const { roomUUID } = params;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    useEffect(() => {
        async function checkLogin(): Promise<void> {
            const token = globalStore.userInfo?.token;
            if (token) {
                try {
                    const result = await loginCheck();
                    setIsLogin(NEED_BINDING_PHONE ? result.hasPhone : true);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        void checkLogin();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function joinRoom(): Promise<void> {
        if (isLogin && roomUUID) {
            const isTurnOffDeviceTest = globalStore.isTurnOffDeviceTest;
            if (isTurnOffDeviceTest) {
                await joinRoomHandler(roomUUID, pushHistory);
            } else {
                pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
            }
        } else {
            sessionStorage.setItem("roomUUID", roomUUID);
            pushHistory(RouteNameType.LoginPage);
        }
    }

    const isMobile = width <= 480;

    const privacyURL = i18n.language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL;
    const serviceURL = i18n.language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL;

    return (
        <div>
            {isMobile ? (
                <JoinPageMobile
                    privacyURL={privacyURL}
                    roomUUID={roomUUID}
                    serviceURL={serviceURL}
                />
            ) : (
                <JoinPageDesktop
                    avatar={globalStore.userInfo?.avatar ?? ""}
                    isLogin={isLogin}
                    joinRoom={joinRoom}
                    privacyURL={privacyURL}
                    roomUUID={roomUUID}
                    serviceURL={serviceURL}
                />
            )}
        </div>
    );
});

export default JoinPage;

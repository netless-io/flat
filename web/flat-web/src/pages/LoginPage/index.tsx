import "./style.less";

import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { LoginButton, LoginButtonProviderType, LoginPanel } from "flat-components";
import { LoginDisposer } from "./utils";
import { githubLogin } from "./githubLogin";
import { RouteNameType, usePushHistory, useURLParams } from "../../utils/routes";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { WeChatLogin } from "./WeChatLogin";
import { joinRoomHandler } from "../utils/join-room-handler";
import { PRIVACY_URL, PRIVACY_URL_CN, SERVICE_URL, SERVICE_URL_CN } from "../../constants/process";
import { useTranslation } from "react-i18next";
import { agoraLogin } from "./agoraLogin";
import { message } from "antd";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { agoraSSOLoginCheck, loginCheck } from "../../api-middleware/flatServer";

export const LoginPage = observer(function LoginPage() {
    const { i18n } = useTranslation();
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const loginDisposer = useRef<LoginDisposer>();

    const [isWeChatLogin, setWeChatLogin] = useState<boolean>(false);
    const [agreement, setAgreement] = useState<boolean>(false);
    const roomUUID = sessionStorage.getItem("roomUUID");

    const sp = useSafePromise();
    const urlParams = useURLParams();

    useEffect(() => {
        return () => {
            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }
            sessionStorage.clear();
        };
    }, []);

    useEffect(() => {
        if (urlParams.utm_source === "agora" && !globalStore.agoraSSOLoginID) {
            return;
        }

        const effect = async (): Promise<void> => {
            const { jwtToken } = await sp(agoraSSOLoginCheck(globalStore.agoraSSOLoginID!));
            const userInfo = await sp(loginCheck(jwtToken));

            globalStore.updateUserInfo(userInfo);
            pushHistory(RouteNameType.HomePage);
        };

        effect().catch(error => {
            // no handling required
            console.warn(error);
        });
    });

    const handleLogin = useCallback(
        (loginChannel: LoginButtonProviderType) => {
            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }
            const doLogin = (loginChannel: LoginButtonProviderType): void => {
                switch (loginChannel) {
                    case "agora": {
                        loginDisposer.current = agoraLogin(async ({ agoraSSOLoginID, ...rest }) => {
                            globalStore.agoraSSOLoginID = agoraSSOLoginID ?? null;

                            globalStore.updateUserInfo(rest);
                            if (!roomUUID) {
                                pushHistory(RouteNameType.HomePage);
                                return;
                            }
                            if (globalStore.isTurnOffDeviceTest) {
                                await joinRoomHandler(roomUUID, pushHistory);
                            } else {
                                pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
                            }
                        });
                        return;
                    }
                    case "github": {
                        loginDisposer.current = githubLogin(async authData => {
                            globalStore.updateUserInfo(authData);
                            if (!roomUUID) {
                                pushHistory(RouteNameType.HomePage);
                                return;
                            }
                            if (globalStore.isTurnOffDeviceTest) {
                                await joinRoomHandler(roomUUID, pushHistory);
                            } else {
                                pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
                            }
                        });
                        return;
                    }
                    case "wechat": {
                        setWeChatLogin(true);
                        return;
                    }
                    default: {
                        return;
                    }
                }
            };
            if (agreement) {
                doLogin(loginChannel);
            } else {
                void message.info(i18n.t("agree-terms"));
            }
        },
        [agreement, globalStore, i18n, pushHistory, roomUUID],
    );

    const privacyURL = i18n.language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL;
    const serviceURL = i18n.language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL;

    function renderButtonList({ utm_source }: Record<string, any>): React.ReactNode {
        if (utm_source === "agora") {
            return (
                <>
                    <LoginButton
                        provider="agora"
                        text={i18n.t("login-agora")}
                        onLogin={handleLogin}
                    />
                </>
            );
        } else {
            return (
                <>
                    <LoginButton
                        provider="wechat"
                        text={i18n.t("login-wechat")}
                        onLogin={handleLogin}
                    />
                    <LoginButton
                        provider="github"
                        text={i18n.t("login-github")}
                        onLogin={handleLogin}
                    />
                </>
            );
        }
    }

    function renderQRCode(): React.ReactNode {
        return <WeChatLogin />;
    }

    return (
        <div className="login-page-container">
            <LoginPanel
                agreementChecked={agreement}
                handleClickAgreement={() => setAgreement(!agreement)}
                handleHideQRCode={() => setWeChatLogin(false)}
                privacyURL={privacyURL}
                renderButtonList={() => renderButtonList(urlParams)}
                renderQRCode={renderQRCode}
                serviceURL={serviceURL}
                showQRCode={isWeChatLogin}
            />
        </div>
    );
});

export default LoginPage;

/* eslint react/jsx-no-target-blank: off */
import logoSVG from "./icons/logo.svg";
import "./index.less";

import React, { useState } from "react";
import { LoginChannel, LoginChannelType } from "../LoginChannel";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { message, Checkbox } from "antd";
import { useTranslation } from "react-i18next";

export interface LoginContentProps {
    onLogin: (loginChannel: LoginChannelType) => React.ReactElement | undefined;
    privacyURL?: string;
    serviceURL?: string;
}

export const LoginContent: React.FC<LoginContentProps> = ({ onLogin, privacyURL, serviceURL }) => {
    const { t } = useTranslation();
    const [inPageLogin, setInPageLogin] = useState<React.ReactElement | undefined>();
    const [isChecked, setIsChecked] = useState(false);

    return (
        <SwitchTransition mode="out-in">
            <CSSTransition
                in={!inPageLogin}
                key={inPageLogin ? "wechat" : "qrcode"}
                timeout={400}
                classNames="slider-in"
                unmountOnExit
            >
                {!inPageLogin ? (
                    <div className="login-content-container">
                        <div className="login-content-logo">
                            <img src={logoSVG} />
                            <span className="login-content-title">{t("welcome-to-Flat")}</span>
                            <span className="login-content-text">
                                {t("online-interaction-to-synchronize-ideas")}
                            </span>
                        </div>
                        <div className="login-content-channel">
                            <LoginChannel
                                onLogin={loginChannel => {
                                    if (!isChecked) {
                                        void message.info(t("agree-terms"));
                                    } else {
                                        setInPageLogin(onLogin(loginChannel));
                                    }
                                }}
                            />
                        </div>
                        <div className="login-content-agreement">
                            <Checkbox
                                defaultChecked={isChecked}
                                onClick={() => setIsChecked(!isChecked)}
                            >
                                {t("have-read-and-agree")}{" "}
                                <a href={privacyURL} target="_blank">
                                    {t("privacy-agreement")}
                                </a>{" "}
                                {t("and")}{" "}
                                <a href={serviceURL} target="_blank">
                                    {t("service-policy")}
                                </a>
                            </Checkbox>
                        </div>
                    </div>
                ) : (
                    <div className="login-content-container">
                        <div className="qr-code-container">
                            <div className="qr-code">{inPageLogin}</div>
                            <a className="qr-code-link" onClick={() => setInPageLogin(void 0)}>
                                {t("login-using-other-methods")}
                            </a>
                        </div>
                    </div>
                )}
            </CSSTransition>
        </SwitchTransition>
    );
};

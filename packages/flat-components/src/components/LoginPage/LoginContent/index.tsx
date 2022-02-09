/* eslint react/jsx-no-target-blank: off */
import "./index.less";

import logoSVG from "./icons/logo.svg";
import QRCodeSVG from "./icons/qr-code.svg";
import React from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useTranslation } from "react-i18next";
import { Checkbox } from "antd";

export interface LoginContentProps {
    showQRCode: boolean;
    handleHideQRCode: () => void;
    agreementChecked: boolean;
    handleClickAgreement: () => void;
    renderButtonList: () => React.ReactNode;
    renderQRCode?: () => React.ReactNode;
    privacyURL?: string;
    serviceURL?: string;
}

export const LoginContent: React.FC<LoginContentProps> = ({
    showQRCode,
    handleHideQRCode,
    agreementChecked,
    handleClickAgreement,
    privacyURL,
    serviceURL,
    renderButtonList,
    renderQRCode = () => <img src={QRCodeSVG} />,
}) => {
    const { t } = useTranslation();
    return (
        <SwitchTransition mode="out-in">
            <CSSTransition
                key={showQRCode ? "wechat" : "qrcode"}
                unmountOnExit
                classNames="slider-in"
                in={!showQRCode}
                timeout={400}
            >
                <div className="login-content-container">
                    {showQRCode ? (
                        <div className="qr-code-container">
                            <div className="qr-code">{renderQRCode()}</div>
                            <a className="qr-code-link" onClick={handleHideQRCode}>
                                {t("login-using-other-methods")}
                            </a>
                        </div>
                    ) : (
                        <>
                            <div className="login-content-logo">
                                <img src={logoSVG} />
                                <span className="login-content-title">{t("welcome-to-Flat")}</span>
                                <span className="login-content-text">
                                    {t("online-interaction-to-synchronize-ideas")}
                                </span>
                            </div>
                            <div className="login-content-channel">{renderButtonList()}</div>
                            <div className="login-content-agreement">
                                <Checkbox
                                    defaultChecked={agreementChecked}
                                    onClick={handleClickAgreement}
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
                        </>
                    )}
                </div>
            </CSSTransition>
        </SwitchTransition>
    );
};

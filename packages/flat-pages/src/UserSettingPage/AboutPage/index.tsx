import React from "react";
import { useTranslate } from "@netless/flat-i18n";
import logoSVG from "../icons/logo.svg";
import logoSGSVG from "../icons/logo-en.svg";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import "./index.less";

export const AboutPage = (): React.ReactElement => {
    const t = useTranslate();
    return (
        <UserSettingLayoutContainer>
            <div className="about-page-container">
                <div className="about-page-middle-container">
                    <img
                        alt="app logo"
                        src={process.env.FLAT_REGION === "CN" ? logoSVG : logoSGSVG}
                    />
                    <div className="flat-name">{t("app-name")}</div>
                    <div className="flat-version">Version {process.env.VERSION}</div>
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
};

export default AboutPage;

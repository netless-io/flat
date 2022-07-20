import React from "react";
import { useTranslation } from "react-i18next";
import logoSVG from "../icons/logo.svg";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import "./index.less";

export const AboutPage = (): React.ReactElement => {
    const { t } = useTranslation();
    return (
        <UserSettingLayoutContainer>
            <div className="about-page-container">
                <div className="about-page-middle-container">
                    <img alt="app logo" src={logoSVG} />
                    <div className="flat-name">{t("app-name")}</div>
                    <div className="flat-version">Version {process.env.VERSION}</div>
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
};

export default AboutPage;

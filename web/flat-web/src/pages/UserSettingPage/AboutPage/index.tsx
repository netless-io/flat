import React from "react";
import logoSVG from "../icons/logo.svg";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import "./index.less";

export const AboutPage = (): React.ReactElement => {
    return (
        <UserSettingLayoutContainer>
            <div className="about-page-container">
                <div className="about-page-middle-container">
                    <img src={logoSVG} alt="flat logo" />
                    <div className="flat-name">Flat</div>
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
};

export default AboutPage;

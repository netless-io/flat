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
                {/* <div className="about-page-bottom-container">
                    <a href="">服务协议</a>｜<a href="">隐私政策</a>｜<a href="">GitHub</a>
                </div> */}
            </div>
        </UserSettingLayoutContainer>
    );
};

export default AboutPage;

import logoSVG from "../icons/logo.svg";
import updateSVG from "../icons/update.svg";
import "./index.less";

import React from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { Button } from "antd";

export const AboutPage = (): React.ReactElement => {
    return (
        <UserSettingLayoutContainer>
            <div className="about-page-container">
                <div className="about-page-middle-container">
                    <img src={logoSVG} alt="flat logo" />
                    <div className="flat-name">Flat</div>
                    <div className="flat-version">Version 2.2.0</div>
                    <Button type="primary">
                        <img src={updateSVG} />
                        更新
                    </Button>
                </div>
                {/* <div className="about-page-bottom-container">
                    <a href="">服务协议</a>｜<a href="">隐私政策</a>｜<a href="">GitHub</a>
                </div> */}
            </div>
        </UserSettingLayoutContainer>
    );
};

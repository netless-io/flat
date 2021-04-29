import logoSVG from "./icons/logo.svg";
import "./index.less";

import React, { useState } from "react";
import { LoginChannel, LoginChannelType } from "../LoginChannel";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { message, Checkbox } from "antd";

export interface LoginContentProps {
    onLogin: (loginChannel: LoginChannelType) => React.ReactElement | undefined;
}

export const LoginContent: React.FC<LoginContentProps> = ({ onLogin }) => {
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
                            <span className="login-content-title">欢迎使用 Flat</span>
                            <span className="login-content-text">在线互动，让想法同步</span>
                        </div>
                        <div className="login-content-channel">
                            <LoginChannel
                                onLogin={loginChannel => {
                                    if (!isChecked) {
                                        message.info("请先同意服务条款");
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
                                已阅读并同意 <a href="">隐私协议</a> 和 <a href="">服务政策</a>
                            </Checkbox>
                        </div>
                    </div>
                ) : (
                    <div className="login-content-container">
                        <div className="qr-code-container">
                            <div className="qr-code">{inPageLogin}</div>
                            <a onClick={() => setInPageLogin(void 0)}>使用其他方式登陆</a>
                        </div>
                    </div>
                )}
            </CSSTransition>
        </SwitchTransition>
    );
};

import { Meta, Story } from "@storybook/react";
import { message, Modal } from "antd";
import React, { useState } from "react";
import { LoginButton, LoginButtonProviderType, LoginPanel, LoginPanelProps } from ".";
import { useTranslation } from "react-i18next";

const storyMeta: Meta = {
    title: "LoginPage/LoginPanel",
    component: LoginPanel,
    parameters: {
        layout: "fullscreen",
        viewport: {
            viewports: {
                desktop: {
                    name: "Desktop",
                    styles: { width: "960px", height: "640px" },
                },
                web: {
                    name: "Web",
                    styles: { width: "1440px", height: "674px" },
                },
            },
            defaultViewport: "desktop",
        },
        options: {
            showPanel: false,
        },
    },
};

export default storyMeta;

export const PlayableExample: Story<LoginPanelProps> = () => {
    const [isWeChatLogin, setWeChatLogin] = useState<boolean>(false);

    const handleHideQRCode = (): void => {
        setWeChatLogin(!isWeChatLogin);
    };

    const [agreement, setAgreement] = useState<boolean>(false);

    const { i18n } = useTranslation();

    function renderButtonList(): React.ReactNode {
        const handleLogin = (loginChannel: LoginButtonProviderType): void => {
            if (!agreement) {
                void message.info(i18n.t("agree-terms"));
                return;
            }

            switch (loginChannel) {
                case "wechat": {
                    setWeChatLogin(true);
                    break;
                }
                case "github": {
                    Modal.info({
                        content: "need i18n",
                    });
                    break;
                }
                default: {
                    break;
                }
            }
        };

        return (
            <>
                <LoginButton
                    provider={"wechat"}
                    text={i18n.t("login-wechat")}
                    onLogin={handleLogin}
                />
                <LoginButton
                    provider={"github"}
                    text={i18n.t("login-github")}
                    onLogin={handleLogin}
                />
            </>
        );
    }

    return (
        <div className="vh-100">
            <LoginPanel
                agreementChecked={agreement}
                handleClickAgreement={() => setAgreement(!agreement)}
                handleHideQRCode={handleHideQRCode}
                renderButtonList={renderButtonList}
                showQRCode={isWeChatLogin}
            />
        </div>
    );
};

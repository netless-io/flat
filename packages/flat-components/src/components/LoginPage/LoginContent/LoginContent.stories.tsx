import { Meta, Story } from "@storybook/react";
import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LoginContent, LoginContentProps } from "./index";
import { message } from "antd";
import { LoginButton } from "..";

const storyMeta: Meta = {
    title: "LoginPage/LoginContent",
    component: LoginContent,
};

export default storyMeta;

export const Overview: Story<LoginContentProps> = () => {
    const { i18n } = useTranslation();
    const [showQRCode, updateShowQRCode] = useState<boolean>(false);

    const [agreement, updateAgreement] = useState<boolean>(false);

    const handleLogin = useCallback(() => {
        agreement === false && void message.info(i18n.t("agree-terms"));
    }, [agreement, i18n]);

    const { t } = useTranslation();

    function renderButtonList(): React.ReactNode {
        return (
            <>
                <LoginButton provider={"wechat"} text={t("login-wechat")} onLogin={handleLogin} />
                <LoginButton provider={"github"} text={t("login-github")} onLogin={handleLogin} />
            </>
        );
    }

    return (
        <div className="vh-75">
            <LoginContent
                agreementChecked={agreement}
                handleClickAgreement={() => updateAgreement(!agreement)}
                handleHideQRCode={() => updateShowQRCode(false)}
                renderButtonList={renderButtonList}
                showQRCode={showQRCode}
            />
        </div>
    );
};

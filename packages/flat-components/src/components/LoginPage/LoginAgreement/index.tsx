import "./index.less";

import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "antd";

export interface LoginAgreementProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    privacyURL?: string;
    serviceURL?: string;
}

export const LoginAgreement: React.FC<LoginAgreementProps> = ({
    checked,
    onChange,
    privacyURL,
    serviceURL,
}) => {
    const { t } = useTranslation();

    return (
        <div className="login-agreement">
            <Checkbox checked={checked} onChange={ev => onChange(ev.target.checked)}>
                {t("have-read-and-agree")}{" "}
                <a href={privacyURL} rel="noreferrer" target="_blank">
                    {t("privacy-agreement")}
                </a>{" "}
                {t("and")}{" "}
                <a href={serviceURL} rel="noreferrer" target="_blank">
                    {t("service-policy")}
                </a>
            </Checkbox>
        </div>
    );
};

import "./index.less";

import { Radio } from "antd";
import React from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { useTranslation } from "react-i18next";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = (): React.ReactElement => {
    const { t } = useTranslation();
    return (
        <UserSettingLayoutContainer>
            <div className="general-setting-container">
                <div className="general-setting-select-language">
                    <span>{t("language-settings")}</span>
                    <Radio.Group defaultValue={SelectLanguage.Chinese}>
                        <Radio value={SelectLanguage.Chinese}>{t("chinese")}</Radio>
                        <Radio disabled value={SelectLanguage.English}>
                            English
                        </Radio>
                    </Radio.Group>
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
};

export default GeneralSettingPage;

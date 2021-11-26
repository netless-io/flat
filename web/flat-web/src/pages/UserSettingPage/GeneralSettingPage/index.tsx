import "./index.less";

import { Checkbox, Radio } from "antd";
import React, { useContext } from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { useTranslation } from "react-i18next";
import type { CheckboxChangeEvent } from "antd/lib/checkbox";
import { GlobalStoreContext } from "../../../components/StoreProvider";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = (): React.ReactElement => {
    const globalStore = useContext(GlobalStoreContext);

    const { t, i18n } = useTranslation();

    function changeLanguage(event: CheckboxChangeEvent): void {
        const language: SelectLanguage = event.target.value;
        void i18n.changeLanguage(language === SelectLanguage.Chinese ? "zh-CN" : "en");
    }

    return (
        <UserSettingLayoutContainer>
            <div className="general-setting-container">
                <div className="general-setting-select-language">
                    <span>{t("language-settings")}</span>
                    <Radio.Group
                        defaultValue={
                            i18n.language === "zh-CN"
                                ? SelectLanguage.Chinese
                                : SelectLanguage.English
                        }
                        onChange={changeLanguage}
                    >
                        <Radio value={SelectLanguage.Chinese}>{t("chinese")}</Radio>
                        <Radio value={SelectLanguage.English}>English</Radio>
                    </Radio.Group>
                </div>
                <div className="general-setting-device-test-box">
                    <div className="general-setting-checkbox-title">{t("device-test-option")}</div>
                    <Checkbox
                        defaultChecked={!globalStore.isTurnOffDeviceTest}
                        onClick={() => {
                            globalStore.toggleDeviceTest();
                        }}
                    >
                        {t("turn-on-device-test")}
                    </Checkbox>
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
};

export default GeneralSettingPage;

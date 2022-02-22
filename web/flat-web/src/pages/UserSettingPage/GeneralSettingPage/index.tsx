import "./index.less";

import { FlatPrefersColorScheme, AppearancePicker } from "flat-components";
import { Checkbox, Radio } from "antd";
import React, { useContext } from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { useTranslation } from "react-i18next";
import type { CheckboxChangeEvent } from "antd/lib/checkbox";
import { ConfigStoreContext, GlobalStoreContext } from "../../../components/StoreProvider";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = (): React.ReactElement => {
    const globalStore = useContext(GlobalStoreContext);
    const configStore = useContext(ConfigStoreContext);

    const { t, i18n } = useTranslation();

    function changeLanguage(event: CheckboxChangeEvent): void {
        const language: SelectLanguage = event.target.value;
        void i18n.changeLanguage(language === SelectLanguage.Chinese ? "zh-CN" : "en");
    }

    const changeAppearance = (event: CheckboxChangeEvent): void => {
        const prefersColorScheme: FlatPrefersColorScheme = event.target.value;
        configStore.updatePrefersColorScheme(prefersColorScheme);
    };

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
                        <Radio value={SelectLanguage.Chinese}>
                            <span className="radio-item-inner">{t("chinese")}</span>
                        </Radio>
                        <Radio value={SelectLanguage.English}>
                            <span className="radio-item-inner">English</span>
                        </Radio>
                    </Radio.Group>
                </div>
                <div className="general-setting-appearance-picker-container">
                    <span>{t("flat-appearance-setting")}</span>
                    <AppearancePicker
                        changeAppearance={changeAppearance}
                        defaultValue={configStore.prefersColorScheme}
                    />
                </div>
                <div className="general-setting-device-test-box">
                    <div className="general-setting-checkbox-title">{t("device-test-option")}</div>
                    <Checkbox
                        defaultChecked={!globalStore.isTurnOffDeviceTest}
                        onClick={() => {
                            globalStore.toggleDeviceTest();
                        }}
                    >
                        <span className="checkbox-item-inner">{t("turn-on-device-test")}</span>
                    </Checkbox>
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
};

export default GeneralSettingPage;

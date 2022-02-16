import "./style.less";

import { Checkbox, Radio, RadioChangeEvent } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { ipcSyncByApp, ipcAsyncByApp } from "../../../utils/ipc";
import { useTranslation } from "react-i18next";
import { AppearancePicker, FlatPrefersColorScheme } from "flat-components";
import { ConfigStoreContext } from "../../../components/StoreProvider";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = (): React.ReactElement => {
    const { t, i18n } = useTranslation();
    const [openAtLogin, setOpenAtLogin] = useState(false);
    const configStore = useContext(ConfigStoreContext);

    useEffect(() => {
        ipcSyncByApp("get-open-at-login")
            .then(data => {
                setOpenAtLogin(data);
            })
            .catch(err => {
                console.error("ipc failed", err);
            });
    }, []);

    const toggleOpenAtLogin = (): void => {
        setOpenAtLogin(!openAtLogin);
        ipcAsyncByApp("set-open-at-login", {
            isOpenAtLogin: !openAtLogin,
        });
    };

    async function changeLanguage(event: RadioChangeEvent): Promise<void> {
        const language: SelectLanguage = event.target.value;
        await i18n.changeLanguage(language === SelectLanguage.Chinese ? "zh-CN" : "en");
    }

    const changeAppearance = (event: RadioChangeEvent): void => {
        const prefersColorScheme: FlatPrefersColorScheme = event.target.value;
        configStore.updatePrefersColorScheme(prefersColorScheme);
    };

    return (
        <UserSettingLayoutContainer>
            <div className="general-setting-container">
                <div className="general-setting-checkbox">
                    <Checkbox checked={openAtLogin} onClick={toggleOpenAtLogin}>
                        {t("boot-up-and-run-automatically")}
                    </Checkbox>
                </div>
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
                <div className="general-setting-appearance-picker-container">
                    <span>{t("flat-appearance-setting")}</span>
                    <AppearancePicker
                        changeAppearance={changeAppearance}
                        defaultValue={configStore.prefersColorScheme}
                    />
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
};

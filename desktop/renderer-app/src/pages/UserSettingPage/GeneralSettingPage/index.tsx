import React, { useEffect, useState } from "react";
import { Checkbox, Radio } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { useTranslation } from "react-i18next";
import { ipcAsyncByApp, ipcSyncByApp } from "../../../utils/ipc";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import "./style.less";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = (): React.ReactElement => {
    const { t, i18n } = useTranslation();
    const [openAtLogin, setOpenAtLogin] = useState(false);

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

    async function changeLanguage(event: CheckboxChangeEvent): Promise<void> {
        const language: SelectLanguage = event.target.value;
        await i18n.changeLanguage(language === SelectLanguage.Chinese ? "zh-CN" : "en");
    }

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
            </div>
        </UserSettingLayoutContainer>
    );
};

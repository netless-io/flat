import "./style.less";

import { Checkbox, Radio } from "antd";
import React, { useEffect, useState } from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { ipcSyncByApp, ipcAsyncByApp } from "../../../utils/ipc";
import { useTranslation } from "react-i18next";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = (): React.ReactElement => {
    const { t } = useTranslation();
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

    return (
        <UserSettingLayoutContainer>
            <div className="general-setting-container">
                <div className="general-setting-checkbox">
                    <Checkbox onClick={toggleOpenAtLogin} checked={openAtLogin}>
                        {t("boot-up-and-run-automatically")}
                    </Checkbox>
                </div>
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

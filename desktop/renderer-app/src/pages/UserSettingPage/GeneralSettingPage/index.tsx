import "./style.less";

import { Button, Checkbox, Input, Radio, RadioChangeEvent } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { ipcSyncByApp, ipcAsyncByApp } from "../../../utils/ipc";
import { useTranslation } from "react-i18next";
import { AppearancePicker, FlatPrefersColorScheme } from "flat-components";
import { ConfigStoreContext, GlobalStoreContext } from "../../../components/StoreProvider";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { loginCheck, rename } from "../../../api-middleware/flatServer";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = (): React.ReactElement => {
    const sp = useSafePromise();
    const { t, i18n } = useTranslation();
    const [openAtLogin, setOpenAtLogin] = useState(false);
    const configStore = useContext(ConfigStoreContext);
    const globalStore = useContext(GlobalStoreContext);

    const [name, setName] = useState(globalStore.userName || "");
    const [isRenaming, setRenaming] = useState(false);

    async function changeUserName(): Promise<void> {
        if (name !== globalStore.userName) {
            setRenaming(true);
            await sp(rename(name));
            setRenaming(false);
            // Refresh user info in global store.
            const result = await sp(loginCheck());
            globalStore.updateUserInfo(result);
            globalStore.updateLastLoginCheck(Date.now());
        }
    }

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
                        <span className="checkbox-item-inner">
                            {t("boot-up-and-run-automatically")}
                        </span>
                    </Checkbox>
                </div>
                <div className="general-setting-user-profile">
                    <span>{t("user-profile")}</span>
                    <label htmlFor="username">{t("username")}</label>
                    <Input
                        disabled={isRenaming}
                        id="username"
                        value={name}
                        onChange={ev => setName(ev.currentTarget.value)}
                    />
                    <Button
                        disabled={isRenaming}
                        loading={isRenaming}
                        type="link"
                        onClick={changeUserName}
                    >
                        修改
                    </Button>
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
                        <Radio value={SelectLanguage.Chinese}>
                            <span className="radio-item-inner">{t("chinese")}</span>
                        </Radio>
                        <Radio value={SelectLanguage.English}>
                            <span className="radio-item-inner">English</span>
                        </Radio>
                    </Radio.Group>
                </div>
                <div className="general-setting-appearance-picker-container">
                    <span>{t("app-appearance-setting")}</span>
                    <AppearancePicker
                        changeAppearance={changeAppearance}
                        defaultValue={configStore.prefersColorScheme}
                    />
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
};

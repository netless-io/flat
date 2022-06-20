import "./style.less";

import React, { useContext, useEffect, useState } from "react";
import { Button, Checkbox, Input, message, Modal, Radio, RadioChangeEvent } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { AppearancePicker, FlatPrefersColorScheme } from "flat-components";

import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { ipcSyncByApp, ipcAsyncByApp } from "../../../utils/ipc";
import { ConfigStoreContext, GlobalStoreContext } from "../../../components/StoreProvider";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import {
    deleteAccount,
    deleteAccountValidate,
    loginCheck,
    rename,
} from "../../../api-middleware/flatServer";
import { ConfirmButtons } from "./ConfirmButtons";
import { UploadAvatar, uploadAvatar } from "./UploadAvatar";
import { useBindingList } from "./binding";
import { BindWeChat } from "./binding/WeChat";
import { BindGitHub } from "./binding/GitHub";
import { RouteNameType, usePushHistory } from "../../../utils/routes";
import { errorTips } from "../../../components/Tips/ErrorTips";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = observer(function GeneralSettingPage() {
    const sp = useSafePromise();
    const pushHistory = usePushHistory();
    const { t, i18n } = useTranslation();
    const [openAtLogin, setOpenAtLogin] = useState(false);
    const configStore = useContext(ConfigStoreContext);
    const globalStore = useContext(GlobalStoreContext);

    const [name, setName] = useState(globalStore.userName || "");
    const [isRenaming, setRenaming] = useState(false);
    const { bindings, refresh: refreshBindings } = useBindingList();

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

    async function onUpload(file: File): Promise<void> {
        try {
            await uploadAvatar(file);
        } catch (error) {
            message.info(t("upload-avatar-failed"));
            throw error;
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

    async function removeAccount(): Promise<void> {
        const { alreadyJoinedRoomCount } = await sp(deleteAccountValidate());
        if (alreadyJoinedRoomCount > 0) {
            message.error(t("quit-all-rooms-before-delete-account"));
            return;
        }
        Modal.confirm({
            content: t("confirm-delete-account"),
            onOk: async () => {
                try {
                    await sp(deleteAccount());
                    globalStore.updateUserInfo(null);
                    pushHistory(RouteNameType.LoginPage);
                } catch (err) {
                    errorTips(err);
                }
            },
        });
    }

    return (
        <UserSettingLayoutContainer>
            <div className="general-setting-container">
                <div className="general-setting-user-profile">
                    <span className="general-setting-title">{t("user-profile")}</span>
                    <div className="general-setting-user-avatar-wrapper">
                        <span className="general-setting-subtitle">{t("avatar")}</span>
                        <UploadAvatar onUpload={onUpload} />
                    </div>
                    <div>
                        <span className="general-setting-subtitle">{t("username")}</span>
                        <Input
                            disabled={isRenaming}
                            id="username"
                            spellCheck={false}
                            value={name}
                            onChange={ev => setName(ev.currentTarget.value)}
                        />
                        <ConfirmButtons onConfirm={changeUserName} />
                    </div>
                    <div className="general-setting-binding-methods">
                        <BindWeChat
                            globalStore={globalStore}
                            isBind={bindings.wechat}
                            onRefresh={refreshBindings}
                        />
                        <BindGitHub
                            globalStore={globalStore}
                            isBind={bindings.github}
                            onRefresh={refreshBindings}
                        />
                    </div>
                </div>
                <div className="general-setting-checkbox">
                    <Checkbox checked={openAtLogin} onClick={toggleOpenAtLogin}>
                        <span className="checkbox-item-inner">
                            {t("boot-up-and-run-automatically")}
                        </span>
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
                <div className="general-setting-user-account">
                    <span className="general-setting-title">{t("delete-account")}</span>
                    <div>
                        <Button danger onClick={removeAccount}>
                            {t("delete-account")}
                        </Button>
                    </div>
                </div>
            </div>
        </UserSettingLayoutContainer>
    );
});

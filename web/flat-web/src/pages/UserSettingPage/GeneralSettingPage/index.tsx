import type { CheckboxChangeEvent } from "antd/lib/checkbox";

import "./index.less";

import React, { useContext, useState } from "react";
import { Checkbox, Input, message, Radio } from "antd";
import { FlatPrefersColorScheme, AppearancePicker } from "flat-components";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { useTranslation } from "react-i18next";
import { ConfigStoreContext, GlobalStoreContext } from "../../../components/StoreProvider";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { loginCheck, rename } from "../../../api-middleware/flatServer";
import { ConfirmButtons } from "./ConfirmButtons";
import { uploadAvatar, UploadAvatar } from "./UploadAvatar";

enum SelectLanguage {
    Chinese,
    English,
}

export const GeneralSettingPage = (): React.ReactElement => {
    const globalStore = useContext(GlobalStoreContext);
    const configStore = useContext(ConfigStoreContext);

    const sp = useSafePromise();
    const { t, i18n } = useTranslation();

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

    async function onUpload(file: File): Promise<void> {
        try {
            await uploadAvatar(file);
        } catch (error) {
            message.info(t("upload-avatar-failed"));
            throw error;
        }
    }

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

import type { CheckboxChangeEvent } from "antd/lib/checkbox";

import "./index.less";

import phoneSVG from "./icons/phone.svg";
import emailSVG from "./icons/email.svg";
import lockSVG from "./icons/lock.svg";

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FlatI18n, useLanguage, useTranslate } from "@netless/flat-i18n";
import { Button, Checkbox, message, Modal, Radio } from "antd";
import { observer } from "mobx-react-lite";
import {
    FlatPrefersColorScheme,
    AppearancePicker,
    errorTips,
    LoginButtonProviderType,
    SVGCopy,
    PmiExistTip,
    Pmi,
} from "flat-components";
import {
    LoginPlatform,
    deleteAccount,
    deleteAccountValidate,
    getCollectionAgreement,
    loginCheck,
    removeBinding,
    rename,
    setCollectionAgreement,
} from "@netless/flat-server-api";

import { PreferencesStoreContext, GlobalStoreContext } from "../../components/StoreProvider";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { uploadAvatar, UploadAvatar } from "./UploadAvatar";
import { UpdatePasswordModel } from "./UpdatePasswordModel";
import { FLAT_WEB_BASE_URL } from "../../constants/process";
import { UpdateEmailModel } from "./UpdateEmailModel";
import { UpdatePhoneModel } from "./UpdatePhoneModel";
import { EditableInput } from "./EditableInput";
import { BindWeChat } from "./binding/WeChat";
import { BindGitHub } from "./binding/GitHub";
import { BindGoogle } from "./binding/Google";
import { BindingField } from "./BindingField";
import { useBindingList } from "./binding";
import { Region } from "../../utils/join-room-handler";

enum SelectLanguage {
    Chinese,
    English,
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const CollectionAgreement = () => {
    const [isAgree, setAgree] = useState(true);
    const t = useTranslate();
    const sp = useSafePromise();
    useEffect(() => {
        sp(getCollectionAgreement()).then(res => {
            setAgree(res.isAgree);
        });
    }, [sp]);
    async function changeCollectMediaState(event: CheckboxChangeEvent): Promise<void> {
        const isAgree = Boolean(event.target.value);
        await sp(setCollectionAgreement(isAgree));
        setAgree(isAgree);
    }
    return (
        <div className="general-setting-item">
            <div className="general-setting-item-title">{t("collect-media-options")}</div>
            <Radio.Group value={isAgree} onChange={changeCollectMediaState}>
                <Radio value={true}>
                    <span className="radio-item-inner">{t("collect-media-turn-on")}</span>
                </Radio>
                <Radio value={false}>
                    <span className="radio-item-inner">{t("collect-media-turn-off")}</span>
                </Radio>
            </Radio.Group>
        </div>
    );
};

export const GeneralSettingPage = observer(function GeneralSettingPage() {
    const globalStore = useContext(GlobalStoreContext);
    const preferencesStore = useContext(PreferencesStoreContext);

    const sp = useSafePromise();
    const pushHistory = usePushHistory();
    const t = useTranslate();
    const language = useLanguage();

    const [name, setName] = useState(globalStore.userName || "");
    const { bindings, refresh: refreshBindings } = useBindingList();

    const phone = bindings?.meta?.phone || "";
    const email = bindings?.meta?.email || "";

    const [showPasswordModel, setShowPasswordModel] = useState(false);
    const [showEmailModel, setShowEmailModel] = useState(false);
    const [showPhoneModel, setShowPhoneModel] = useState(false);

    const hasPassword = useMemo(() => globalStore.hasPassword, [globalStore.hasPassword]);
    const personalLink = useMemo(
        () => `${FLAT_WEB_BASE_URL}/join/${globalStore.pmi}`,
        [globalStore.pmi],
    );
    const serverRegion = useMemo(
        () => globalStore.serverRegionConfig?.server.region,
        [globalStore.serverRegionConfig?.server.region],
    );
    const loginButtons = useMemo(
        () => process.env.LOGIN_METHODS.split(",") as LoginButtonProviderType[],
        [],
    );

    useEffect(() => {
        const checkPmi = (): void => {
            if (!globalStore.pmi) {
                globalStore.updatePmi();
            }
        };

        checkPmi();
    }, [globalStore]);

    async function changeUserName(): Promise<void> {
        if (name !== globalStore.userName) {
            await sp(rename(name));
            // Refresh user info in global store.
            const result = await sp(loginCheck());
            globalStore.updateUserInfo(result);
            globalStore.updateLastLoginCheck(Date.now());
        }
    }

    async function onUpload(file: File): Promise<void> {
        try {
            await uploadAvatar(file, t);
        } catch (error) {
            message.info(t("upload-avatar-failed"));
            throw error;
        }
    }
    function changeLanguage(event: CheckboxChangeEvent): void {
        const language: SelectLanguage = event.target.value;
        void FlatI18n.changeLanguage(language === SelectLanguage.Chinese ? "zh-CN" : "en");
    }

    const changeAppearance = (event: CheckboxChangeEvent): void => {
        const prefersColorScheme: FlatPrefersColorScheme = event.target.value;
        preferencesStore.updatePrefersColorScheme(prefersColorScheme);
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

                    // reset user status
                    globalStore.deleteAccount();

                    pushHistory(RouteNameType.LoginPage);
                } catch (err) {
                    errorTips(err);
                }
            },
        });
    }

    const updatePassword = useCallback(async () => {
        setShowPasswordModel(false);

        // Refresh user info in global store.
        const result = await sp(loginCheck());
        globalStore.updateUserInfo(result);
        globalStore.updateLastLoginCheck(Date.now());
    }, [globalStore, sp]);

    const unbind = useCallback(
        async (content: string, type: LoginPlatform) => {
            Modal.confirm({
                content,
                onOk: async () => {
                    try {
                        const { token } = await sp(removeBinding(type));
                        globalStore.updateUserToken(token);
                        refreshBindings();
                        message.info(t("unbind-success"));
                    } catch (err) {
                        errorTips(err);
                    }
                },
            });
        },
        [globalStore, refreshBindings, sp, t],
    );

    const handleCopy = useCallback(
        (text: string) => {
            navigator.clipboard.writeText(text);
            void message.success(t("copy-success"));
        },
        [t],
    );

    return (
        <UserSettingLayoutContainer>
            <div className="general-setting-container">
                <div className="general-setting-item general-setting-profile">
                    <div>
                        <span className="general-setting-item-title">{t("user-profile")}</span>

                        <div>
                            {EditableInput({
                                value: name,
                                desc: t("username"),
                                setValue: ev => setName(ev.currentTarget.value),
                                updateValue: changeUserName,
                                cancelUpdate: () => setName(globalStore.userName || ""),
                            })}
                        </div>

                        <div>
                            <div className="input-container-bg">
                                <span className="general-setting-item-icon-desc">
                                    {t("personal-room-id")}
                                    <PmiExistTip title={t("pmi-help")} />
                                </span>

                                <Pmi pmi={globalStore.pmi!} />

                                <Button
                                    className="general-setting-item-btn"
                                    title={t("copy")}
                                    type="link"
                                    onClick={() => handleCopy(globalStore.pmi!)}
                                >
                                    <SVGCopy />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <div className="input-container-bg">
                                <span className="general-setting-item-icon-desc">
                                    {t("personal-room-link")}
                                </span>
                                <span title={personalLink}>{personalLink}</span>
                                <Button
                                    className="general-setting-item-btn"
                                    type="link"
                                    onClick={() => handleCopy(personalLink)}
                                >
                                    <SVGCopy />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <UploadAvatar onUpload={onUpload} />
                </div>
                <hr />
                <div className="general-setting-item">
                    <span className="general-setting-item-title">{t("user-account")}</span>

                    <div>
                        {BindingField({
                            key: phone,
                            msg: t("set-binding-phone"),
                            icon: phoneSVG,
                            desc: t("phone"),
                            payload: {
                                content: t("delete-binding-phone-tips", {
                                    phone,
                                }),
                                type: LoginPlatform.Phone,
                            },
                            handleShowModel: () => setShowPhoneModel(true),
                            unbind,
                        })}
                    </div>
                    <div>
                        {BindingField({
                            key: email,
                            icon: emailSVG,
                            desc: t("email"),
                            msg: t("set-binding-email"),
                            payload: {
                                content: t("delete-binding-email-tips", {
                                    email,
                                }),
                                type: LoginPlatform.Email,
                            },
                            handleShowModel: () => setShowEmailModel(true),
                            unbind,
                        })}
                    </div>
                    <div className="general-setting-item-text input-container-bg">
                        <img alt="password" className="general-setting-item-icon" src={lockSVG} />
                        <span className="general-setting-item-icon-desc">{t("password")}</span>
                        <Button type="link" onClick={() => setShowPasswordModel(true)}>
                            {hasPassword ? t("update-password") : t("set-password")}
                        </Button>
                    </div>
                    <div className="general-setting-binding-methods">
                        {loginButtons.map(button => {
                            switch (button) {
                                case LoginPlatform.Github.toLowerCase(): {
                                    return (
                                        <BindGitHub
                                            key={button}
                                            globalStore={globalStore}
                                            isBind={bindings.github}
                                            name={bindings.meta?.github?.slice(0, 10) || ""}
                                            onRefresh={refreshBindings}
                                        />
                                    );
                                }
                                case LoginPlatform.Google.toLowerCase(): {
                                    return (
                                        <BindGoogle
                                            key={button}
                                            globalStore={globalStore}
                                            isBind={bindings.google}
                                            name={bindings.meta?.google?.slice(0, 10) || ""}
                                            onRefresh={refreshBindings}
                                        />
                                    );
                                }
                                case LoginPlatform.WeChat.toLowerCase(): {
                                    return (
                                        <BindWeChat
                                            key={button}
                                            globalStore={globalStore}
                                            isBind={bindings.wechat}
                                            name={bindings.meta?.wechat?.slice(0, 10) || ""}
                                            onRefresh={refreshBindings}
                                        />
                                    );
                                }
                                default: {
                                    return <></>;
                                }
                            }
                        })}
                    </div>
                </div>
                <hr />
                <div className="general-setting-item">
                    <span className="general-setting-item-title">{t("language-settings")}</span>

                    <Radio.Group
                        defaultValue={
                            language === "zh-CN" ? SelectLanguage.Chinese : SelectLanguage.English
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
                <hr />
                <div className="general-setting-item">
                    <span className="general-setting-item-title">
                        {t("app-appearance-setting")}
                    </span>

                    <AppearancePicker
                        changeAppearance={changeAppearance}
                        value={preferencesStore.prefersColorScheme}
                    />
                </div>
                <hr />
                <div className="general-setting-item">
                    <div className="general-setting-item-title">{t("join-options")}</div>

                    <div className="join-room-settings">
                        <Checkbox
                            checked={preferencesStore.autoMicOn}
                            onClick={() =>
                                preferencesStore.updateAutoMicOn(!preferencesStore.autoMicOn)
                            }
                        >
                            <span className="checkbox-item-inner">
                                {t("turn-on-the-microphone")}
                            </span>
                        </Checkbox>
                        <Checkbox
                            checked={preferencesStore.autoCameraOn}
                            onClick={() =>
                                preferencesStore.updateAutoCameraOn(!preferencesStore.autoCameraOn)
                            }
                        >
                            <span className="checkbox-item-inner">{t("turn-on-the-camera")}</span>
                        </Checkbox>
                        <Checkbox
                            checked={preferencesStore.cursorNameOn}
                            onClick={() =>
                                preferencesStore.updateCursorNameOn(!preferencesStore.cursorNameOn)
                            }
                        >
                            <span className="checkbox-item-inner">{t("turn-on-cursor-name")}</span>
                        </Checkbox>
                        <Checkbox
                            checked={preferencesStore.strokeTail}
                            onClick={preferencesStore.toggleStrokeTail}
                        >
                            <span className="checkbox-item-inner">
                                {t("whiteboard-settings.pencil-tail")}
                            </span>
                        </Checkbox>
                        <Checkbox
                            checked={preferencesStore.autoRecording}
                            onClick={preferencesStore.toggleAutoRecording}
                        >
                            <span className="checkbox-item-inner">
                                {t("recording-settings.auto-recording")}
                            </span>
                        </Checkbox>
                        <Checkbox
                            checked={!globalStore.isTurnOffDeviceTest}
                            onClick={globalStore.toggleDeviceTest}
                        >
                            <span className="checkbox-item-inner">{t("turn-on-device-test")}</span>
                        </Checkbox>
                    </div>
                </div>
                <hr />
                {serverRegion === Region.CN_HZ && (
                    <>
                        <CollectionAgreement />
                        <hr />
                    </>
                )}

                <div className="general-setting-item">
                    <span className="general-setting-item-title">{t("delete-account")}</span>

                    <span className="general-setting-item-desc">{t("delete-account-desc")}</span>
                    <div>
                        <Button danger onClick={removeAccount}>
                            {t("delete-account")}
                        </Button>
                    </div>
                </div>
            </div>

            <UpdatePhoneModel
                title={t("set-binding-phone")}
                visible={showPhoneModel}
                onCancel={() => setShowPhoneModel(false)}
                onConfirm={() => setShowPhoneModel(false)}
                onRefresh={refreshBindings}
            />

            <UpdateEmailModel
                title={t("set-binding-email")}
                visible={showEmailModel}
                onCancel={() => setShowEmailModel(false)}
                onConfirm={() => setShowEmailModel(false)}
                onRefresh={refreshBindings}
            />

            <UpdatePasswordModel
                showOldPassword={hasPassword}
                title={hasPassword ? t("update-password") : t("set-password")}
                visible={showPasswordModel}
                onCancel={() => setShowPasswordModel(false)}
                onConfirm={updatePassword}
            />
        </UserSettingLayoutContainer>
    );
});

export default GeneralSettingPage;

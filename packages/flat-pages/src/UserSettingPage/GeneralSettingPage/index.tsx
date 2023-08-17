import type { CheckboxChangeEvent } from "antd/lib/checkbox";

import "./index.less";

import phoneSVG from "./icons/phone.svg";
import emailSVG from "./icons/email.svg";
import userSVG from "./icons/user.svg";
import editSVG from "./icons/edit.svg";
import lockSVG from "./icons/lock.svg";
import closeSVG from "./icons/close.svg";

import React, { useCallback, useContext, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Checkbox, Input, message, Modal, Radio } from "antd";
import {
    FlatPrefersColorScheme,
    AppearancePicker,
    errorTips,
    LoginButtonProviderType,
} from "flat-components";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { FlatI18n, useLanguage, useTranslate } from "@netless/flat-i18n";

import { PreferencesStoreContext, GlobalStoreContext } from "../../components/StoreProvider";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import {
    LoginPlatform,
    deleteAccount,
    deleteAccountValidate,
    loginCheck,
    removeBinding,
    rename,
} from "@netless/flat-server-api";
// import { ConfirmButtons } from "./ConfirmButtons";
import { uploadAvatar, UploadAvatar } from "./UploadAvatar";
import { UpdatePasswordModel } from "./UpdatePasswordModel";
import { BindWeChat } from "./binding/WeChat";
import { useBindingList } from "./binding";
import { BindGitHub } from "./binding/GitHub";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { BindGoogle } from "./binding/Google";
import { CheckOutlined } from "@ant-design/icons";
import { UpdateEmailModel } from "./UpdateEmailModel";
import { UpdatePhoneModel } from "./UpdatePhoneModel";

enum SelectLanguage {
    Chinese,
    English,
}

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

    const loginButtons = useMemo(
        () => process.env.LOGIN_METHODS.split(",") as LoginButtonProviderType[],
        [],
    );

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
                    globalStore.updateUserInfo(null);
                    globalStore.deleteCurrentAccountFromHistory();
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

    return (
        <UserSettingLayoutContainer>
            <div className="general-setting-container">
                <div className="general-setting-item">
                    <span className="general-setting-item-title">{t("user-profile")}</span>

                    <div className="general-setting-profile">
                        <div className="general-setting-item-text">
                            <img alt="user" src={userSVG} />
                            <span>{t("username")}</span>
                            {EditableInput({
                                value: name,
                                setValue: ev => setName(ev.currentTarget.value),
                                updateValue: changeUserName,
                            })}
                        </div>

                        <UploadAvatar onUpload={onUpload} />
                    </div>
                </div>
                <hr />
                <div className="general-setting-item">
                    <span className="general-setting-item-title">{t("user-account")}</span>

                    <div className="general-setting-item-text">
                        <img alt="phone" src={phoneSVG} />
                        <span>{t("phone")}</span>
                        {bindingField({
                            value: phone,
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

                    <UpdatePhoneModel
                        title={t("set-binding-phone")}
                        visible={showPhoneModel}
                        onCancel={() => setShowPhoneModel(false)}
                        onConfirm={() => setShowPhoneModel(false)}
                        onRefresh={refreshBindings}
                    />

                    <div className="general-setting-item-text">
                        <img alt="email" src={emailSVG} />
                        <span>{t("email")}</span>
                        {bindingField({
                            value: email,
                            handleShowModel: () => setShowEmailModel(true),
                            payload: {
                                content: t("delete-binding-email-tips", {
                                    email,
                                }),
                                type: LoginPlatform.Email,
                            },
                            unbind,
                        })}
                    </div>

                    <UpdateEmailModel
                        title={t("set-binding-email")}
                        visible={showEmailModel}
                        onCancel={() => setShowEmailModel(false)}
                        onConfirm={() => setShowEmailModel(false)}
                        onRefresh={refreshBindings}
                    />

                    <div className="general-setting-item-text">
                        <img alt="password" src={lockSVG} />
                        <span>{t("password")}</span>
                        <Button type="link" onClick={() => setShowPasswordModel(true)}>
                            {hasPassword ? t("update-password") : t("set-password")}
                        </Button>
                    </div>

                    <UpdatePasswordModel
                        showOldPassword={hasPassword}
                        title={hasPassword ? t("update-password") : t("set-password")}
                        visible={showPasswordModel}
                        onCancel={() => setShowPasswordModel(false)}
                        onConfirm={updatePassword}
                    />

                    <div className="general-setting-binding-methods">
                        {loginButtons.map(button => {
                            switch (button) {
                                case LoginPlatform.Github.toLowerCase(): {
                                    return (
                                        <BindGitHub
                                            key={button}
                                            globalStore={globalStore}
                                            isBind={bindings.github}
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
        </UserSettingLayoutContainer>
    );
});

interface BindingFieldProps {
    value: string;
    payload: { content: string; type: LoginPlatform };
    handleShowModel: () => void;
    unbind: (content: string, type: LoginPlatform) => Promise<void>;
}

function bindingField({
    value,
    payload,
    handleShowModel,
    unbind,
}: BindingFieldProps): React.ReactElement {
    const { content, type } = payload;
    return (
        <div>
            {value ? (
                <div className="input-container-bg">
                    <span>{value}</span>
                    <Button type="link" onClick={() => unbind(content, type)}>
                        <img alt="close" src={closeSVG} />
                    </Button>
                </div>
            ) : (
                <Button type="link" onClick={handleShowModel}>
                    <img alt="edit" src={editSVG} />
                </Button>
            )}
        </div>
    );
}

interface EditableInputProps {
    value: string;
    setValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
    updateValue?: () => Promise<void>;
}

function EditableInput({ value, setValue, updateValue }: EditableInputProps): React.ReactElement {
    const [isRenaming, setIsRenaming] = useState(false);

    const handleUpdateValue = useCallback(async () => {
        if (updateValue) {
            await updateValue();
            setIsRenaming(false);
        }
    }, [updateValue]);

    return (
        <div className="input-container-bg">
            {isRenaming ? (
                <>
                    <Input id="username" spellCheck={false} value={value} onChange={setValue} />

                    <Button type="link" onClick={handleUpdateValue}>
                        <CheckOutlined style={{ color: "#3381FF" }} />
                    </Button>
                </>
            ) : (
                <>
                    <span>{value}</span>

                    <Button type="link" onClick={() => setIsRenaming(!isRenaming)}>
                        <img alt="edit" src={editSVG} />
                    </Button>
                </>
            )}
        </div>
    );
}

export default GeneralSettingPage;

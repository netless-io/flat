import showAvatarsJPG from "./assets/show-avatars.jpg?url";
import hideAvatarsJPG from "./assets/hide-avatars.jpg?url";

import type { PreferencesButtonProps } from "./index";

import React, { useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import { Radio } from "antd";
import { FlatI18n, useLanguage, useTranslate } from "@netless/flat-i18n";
import { RoomType } from "@netless/flat-server-api";
import { AppearancePicker } from "flat-components";
import { PreferencesStoreContext } from "../StoreProvider";

export interface GeneralSettingsProps extends PreferencesButtonProps {}

export const GeneralSettings = observer<GeneralSettingsProps>(function GeneralSettings({
    classroom,
}) {
    const t = useTranslate();

    const language = useLanguage();
    const changeLanguage = useCallback((ev: any) => FlatI18n.changeLanguage(ev.target.value), []);

    const preferences = useContext(PreferencesStoreContext);
    const changeAppearance = useCallback(
        (ev: any) => preferences.updatePrefersColorScheme(ev.target.value),
        [preferences],
    );

    const isSmallClass = classroom.roomType === RoomType.SmallClass;

    return (
        <div className="preferences-modal-section" id="preferences-0">
            <h3 className="preferences-modal-section-title">{t("general-settings")}</h3>
            <div className="preferences-modal-section-grid">
                <label className="preferences-modal-section-grid-label" htmlFor="language">
                    {t("language")}
                </label>
                <Radio.Group
                    className="preferences-modal-section-grid-content"
                    id="language"
                    name="language"
                    value={language}
                    onChange={changeLanguage}
                >
                    <Radio value="zh-CN">
                        <span>{t("chinese")}</span>
                    </Radio>
                    <Radio value="en">
                        <span>English</span>
                    </Radio>
                </Radio.Group>
                {isSmallClass && (
                    <>
                        <label className="preferences-modal-section-grid-label" htmlFor="avatars">
                            {t("general-settings-avatars")}
                        </label>
                        <Radio.Group
                            className="preferences-modal-section-grid-content"
                            id="avatars"
                            name="avatars"
                            value={classroom.isAvatarsVisible()}
                            onChange={classroom.toggleAvatars}
                        >
                            <Radio className="preferences-modal-section-radio" value={true}>
                                <img src={showAvatarsJPG} />
                                <span>{t("show")}</span>
                            </Radio>
                            <Radio className="preferences-modal-section-radio" value={false}>
                                <img src={hideAvatarsJPG} />
                                <span>{t("hide")}</span>
                            </Radio>
                        </Radio.Group>
                    </>
                )}
                <label className="preferences-modal-section-grid-label" htmlFor="theme">
                    {t("theme")}
                </label>
                <AppearancePicker
                    changeAppearance={changeAppearance}
                    value={preferences.prefersColorScheme}
                />
            </div>
        </div>
    );
});

import type { PreferencesButtonProps } from "./index";

import React, { useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import { Radio } from "antd";
import { FlatI18n, useLanguage, useTranslate } from "@netless/flat-i18n";
import { AppearancePicker } from "flat-components";
import { PreferencesStoreContext } from "../StoreProvider";

export interface GeneralSettingsProps extends PreferencesButtonProps {}

export const GeneralSettings = observer<GeneralSettingsProps>(function GeneralSettings() {
    const t = useTranslate();

    const language = useLanguage();
    const changeLanguage = useCallback((ev: any) => FlatI18n.changeLanguage(ev.target.value), []);

    const preferences = useContext(PreferencesStoreContext);
    const changeAppearance = useCallback(
        (ev: any) => preferences.updatePrefersColorScheme(ev.target.value),
        [preferences],
    );

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
                    value={language}
                    onChange={changeLanguage}
                >
                    <Radio value="zh-CN">
                        <span className="radio-item-inner">{t("chinese")}</span>
                    </Radio>
                    <Radio value="en">
                        <span className="radio-item-inner">English</span>
                    </Radio>
                </Radio.Group>
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

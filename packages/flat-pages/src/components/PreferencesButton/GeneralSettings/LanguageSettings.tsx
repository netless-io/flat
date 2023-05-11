import type { PreferencesButtonProps } from "../index";
import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { Radio } from "antd";
import { FlatI18n, useLanguage, useTranslate } from "@netless/flat-i18n";

export interface LanguageSettingsProps extends PreferencesButtonProps {}

export const LanguageSettings = observer<LanguageSettingsProps>(function LanguageSettings() {
    const t = useTranslate();

    const language = useLanguage();
    const changeLanguage = useCallback((ev: any) => FlatI18n.changeLanguage(ev.target.value), []);

    return (
        <>
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
        </>
    );
});

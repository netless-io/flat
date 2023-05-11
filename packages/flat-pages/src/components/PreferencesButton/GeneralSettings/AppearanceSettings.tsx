import type { PreferencesButtonProps } from "../index";

import React, { useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import { Radio } from "antd";

import { useTranslate } from "@netless/flat-i18n";
import { PreferencesStoreContext } from "../../StoreProvider";

export interface AppearanceSettingsProps extends PreferencesButtonProps {}

export const AppearanceSettings = observer<AppearanceSettingsProps>(function AppearanceSettings() {
    const t = useTranslate();
    const preferences = useContext(PreferencesStoreContext);

    const changeAppearance = useCallback(
        (ev: any) => preferences.updatePrefersColorScheme(ev.target.value),
        [preferences],
    );

    return (
        <>
            <label className="preferences-modal-section-grid-label first-row" htmlFor="theme">
                {t("theme")}
            </label>
            <Radio.Group
                className="preferences-modal-section-grid-content"
                id="theme"
                name="theme"
                value={preferences.prefersColorScheme}
                onChange={changeAppearance}
            >
                <Radio className="preferences-modal-section-radio" value="light">
                    <span className="preferences-modal-section-theme light">
                        <span className="preferences-modal-section-theme-front"></span>
                        <span className="preferences-modal-section-theme-front"></span>
                        <span className="preferences-modal-section-theme-front"></span>
                    </span>
                    <span>{t("app-appearance-light")}</span>
                </Radio>
                <Radio className="preferences-modal-section-radio" value="dark">
                    <span className="preferences-modal-section-theme dark">
                        <span className="preferences-modal-section-theme-front"></span>
                        <span className="preferences-modal-section-theme-front"></span>
                        <span className="preferences-modal-section-theme-front"></span>
                    </span>
                    <span>{t("app-appearance-dark")}</span>
                </Radio>
                <Radio className="preferences-modal-section-radio" value="auto">
                    <span className="preferences-modal-section-theme auto">
                        <span className="preferences-modal-section-theme light">
                            <span className="preferences-modal-section-theme-front"></span>
                            <span className="preferences-modal-section-theme-front"></span>
                            <span className="preferences-modal-section-theme-front"></span>
                        </span>
                        <span className="preferences-modal-section-theme dark">
                            <span className="preferences-modal-section-theme-front"></span>
                            <span className="preferences-modal-section-theme-front"></span>
                            <span className="preferences-modal-section-theme-front"></span>
                        </span>
                    </span>
                    <span>{t("app-appearance-auto")}</span>
                </Radio>
            </Radio.Group>
        </>
    );
});

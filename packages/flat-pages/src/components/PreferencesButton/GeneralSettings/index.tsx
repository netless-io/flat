import type { PreferencesButtonProps } from "../index";

import React, { useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";

import { useTranslate } from "@netless/flat-i18n";
import { RoomType } from "@netless/flat-server-api";
import { AppearancePicker } from "flat-components";
import { PreferencesStoreContext } from "../../StoreProvider";
import { AvatarsSettings } from "./AvatarsSettings";
import { BackgroundSettings } from "./BackgroundSettings";
import { LanguageSettings } from "./LanguageSettings";

export interface GeneralSettingsProps extends PreferencesButtonProps {}

export const GeneralSettings = observer<GeneralSettingsProps>(function GeneralSettings({
    classroom,
}) {
    const t = useTranslate();

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
                <LanguageSettings classroom={classroom} />
                {isSmallClass && <AvatarsSettings classroom={classroom} />}
                <BackgroundSettings classroom={classroom} />
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

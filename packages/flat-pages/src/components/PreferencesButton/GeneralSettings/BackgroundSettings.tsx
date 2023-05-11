import frontZhSVG from "../assets/front-zh.svg";
import frontEnSVG from "../assets/front-en.svg";

import type { PreferencesButtonProps } from "../index";

import React, { useCallback, useContext } from "react";
import { Radio } from "antd";
import { observer } from "mobx-react-lite";

import { Background } from "@netless/flat-stores";
import { useLanguage, useTranslate } from "@netless/flat-i18n";
import { PreferencesStoreContext } from "../../StoreProvider";

export interface BackgroundSettingsProps extends PreferencesButtonProps {}

const backgrounds: Background[] = ["default", "teal", "grey", "green"];

export const BackgroundSettings = observer<BackgroundSettingsProps>(function BackgroundSettings() {
    const t = useTranslate();
    const language = useLanguage();
    const preferences = useContext(PreferencesStoreContext);

    const changeBackground = useCallback(
        (ev: any) => preferences.updateBackground(ev.target.value),
        [preferences],
    );

    return (
        <>
            <label className="preferences-modal-section-grid-label first-row" htmlFor="background">
                {t("general-settings-background")}
            </label>
            <Radio.Group
                className="preferences-modal-section-grid-content"
                id="background"
                name="background"
                value={preferences.background}
                onChange={changeBackground}
            >
                {backgrounds.map(background => (
                    <Radio
                        key={background}
                        className="preferences-modal-section-radio"
                        value={background}
                    >
                        <span className={"preferences-modal-section-background " + background}>
                            <img
                                alt={t("online-interaction-to-synchronize-ideas")}
                                className="preferences-modal-section-front"
                                src={language === "zh-CN" ? frontZhSVG : frontEnSVG}
                            />
                        </span>
                        <span>{t("background." + background)}</span>
                    </Radio>
                ))}
            </Radio.Group>
        </>
    );
});

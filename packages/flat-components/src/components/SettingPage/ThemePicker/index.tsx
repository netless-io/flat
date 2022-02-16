import lightSVG from "./icons/light.svg";
import darkSVG from "./icons/dark.svg";
import autoSVG from "./icons/auto.svg";
import "./style.less";

import React from "react";
import { useTranslation } from "react-i18next";
import { Radio } from "antd";
import { FlatPrefersColorScheme } from "../../FlatThemeProvider";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

export interface ThemePickerProps {
    defaultValue: FlatPrefersColorScheme;
    changePrefersColorScheme: (event: CheckboxChangeEvent) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
    defaultValue,
    changePrefersColorScheme,
}) => {
    const { t } = useTranslation();
    return (
        <div className="theme-picker-container">
            <Radio.Group defaultValue={defaultValue} onChange={changePrefersColorScheme}>
                <Radio value={"light"}>
                    <div className="theme-picker-option">
                        <img src={lightSVG} />
                        <span>{t("flat-theme-light")}</span>
                    </div>
                </Radio>
                <Radio value={"dark"}>
                    <div className="theme-picker-option">
                        <img src={darkSVG} />
                        <span>{t("flat-theme-dark")}</span>
                    </div>
                </Radio>
                <Radio value={"auto"}>
                    <div className="theme-picker-option">
                        <img src={autoSVG} />
                        <span>{t("flat-theme-auto")}</span>
                    </div>
                </Radio>
            </Radio.Group>
        </div>
    );
};

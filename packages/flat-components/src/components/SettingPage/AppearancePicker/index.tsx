import lightSVG from "./icons/light.svg";
import darkSVG from "./icons/dark.svg";
import autoSVG from "./icons/auto.svg";
import "./style.less";

import React from "react";
import { useTranslate } from "@netless/flat-i18n";
import { Radio, RadioChangeEvent } from "antd";
import { FlatPrefersColorScheme } from "../../FlatThemeProvider";

export interface AppearancePickerProps {
    value: FlatPrefersColorScheme;
    changeAppearance: (event: RadioChangeEvent) => void;
}

export const AppearancePicker: React.FC<AppearancePickerProps> = ({ value, changeAppearance }) => {
    const t = useTranslate();
    return (
        <div className="appearance-picker-container">
            <Radio.Group name="theme" value={value} onChange={changeAppearance}>
                <Radio value={"light"}>
                    <div className="appearance-picker-option">
                        <img src={lightSVG} />
                        <span>{t("app-appearance-light")}</span>
                    </div>
                </Radio>
                <Radio value={"dark"}>
                    <div className="appearance-picker-option">
                        <img src={darkSVG} />
                        <span>{t("app-appearance-dark")}</span>
                    </div>
                </Radio>
                <Radio value={"auto"}>
                    <div className="appearance-picker-option">
                        <img src={autoSVG} />
                        <span>{t("app-appearance-auto")}</span>
                    </div>
                </Radio>
            </Radio.Group>
        </div>
    );
};

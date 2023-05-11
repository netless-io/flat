import showAvatarsJPG from "../assets/show-avatars.jpg?url";
import hideAvatarsJPG from "../assets/hide-avatars.jpg?url";

import type { PreferencesButtonProps } from "../index";

import React from "react";
import { observer } from "mobx-react-lite";
import { Radio } from "antd";
import { useTranslate } from "@netless/flat-i18n";

export interface AvatarsSettingsProps extends PreferencesButtonProps {}

export const AvatarsSettings = observer<AvatarsSettingsProps>(function AvatarsSettings({
    classroom,
}) {
    const t = useTranslate();

    return (
        <>
            <label className="preferences-modal-section-grid-label first-row" htmlFor="avatars">
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
    );
});

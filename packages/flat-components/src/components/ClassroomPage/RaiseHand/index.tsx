import "./style.less";

import React from "react";
import { useTranslation } from "react-i18next";
import { SVGHandUp } from "../../FlatIcons";

export interface RaiseHandProps {
    isRaiseHand?: boolean;
    disableHandRaising?: boolean;
    onRaiseHandChange: () => void;
}

export const RaiseHand: React.FC<RaiseHandProps> = ({
    isRaiseHand,
    disableHandRaising,
    onRaiseHandChange,
}) => {
    const { t } = useTranslation();

    return disableHandRaising ? null : (
        <button className="raise-hand-btn" title={t("raise-your-hand")} onClick={onRaiseHandChange}>
            <SVGHandUp active={isRaiseHand} />
        </button>
    );
};

import "./style.less";

import React from "react";
import { useTranslate } from "@netless/flat-i18n";
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
    const t = useTranslate();

    return disableHandRaising ? null : (
        <button className="raise-hand-btn" title={t("raise-your-hand")} onClick={onRaiseHandChange}>
            <SVGHandUp active={isRaiseHand} />
        </button>
    );
};
